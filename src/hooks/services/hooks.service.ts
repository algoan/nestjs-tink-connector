/* eslint-disable @typescript-eslint/naming-convention, camelcase */
import { ServiceAccount } from '@algoan/rest';
import { Injectable, Inject } from '@nestjs/common';
import { Config } from 'node-config-ts';

import { AggregationDetailsMode } from '../../algoan/dto/customer.enums';
import { CustomerUpdateInput } from '../../algoan/dto/customer.inputs';
import { assertsTypeValidation } from '../../shared/utils/common.utils';
import { TinkAccountObject } from '../../tink/dto/account.objects';
import { TinkAccountService } from '../../tink/services/tink-account.service';
import { TinkProviderService } from '../../tink/services/tink-provider.service';
import { TinkTransactionService } from '../../tink/services/tink-transaction.service';
import { TinkProviderObject } from '../../tink/dto/provider.objects';
import { ExtendedTinkTransactionResponseObject, TinkTransactionResponseObject } from '../../tink/dto/search.objects';
import { AnalysisUpdateInput } from '../../algoan/dto/analysis.inputs';
import { TINK_LINK_ACTOR_CLIENT_ID } from '../../tink/contstants/tink.constants';
import { AggregationDetails, Customer } from '../../algoan/dto/customer.objects';
import { AlgoanCustomerService } from '../../algoan/services/algoan-customer.service';
import { ClientPricing } from '../../algoan/dto/service-account.enums';
import { TinkLinkService } from '../../tink/services/tink-link.service';
import { ClientConfig } from '../../algoan/dto/service-account.objects';
import { TinkUserService } from '../../tink/services/tink-user.service';
import { TinkHttpService } from '../../tink/services/tink-http.service';
import { CreateUserObject } from '../../tink/dto/create-user.object';
import { CONFIG } from '../../config/config.module';
import { AlgoanAnalysisService } from '../../algoan/services/algoan-analysis.service';
import { AlgoanHttpService } from '../../algoan/services/algoan-http.service';

import { AggregatorLinkRequiredDTO } from '../dto/aggregator-link-required-payload.dto';
import { BankDetailsRequiredDTO } from '../dto/bank-details-required-payload.dto';
import { mapTinkDataToAlgoanAnalysis } from '../mappers/analysis.mapper';
import { AccountCheckArgs } from '../../tink/dto/account-check.args';
import { AnalysisStatus, ErrorCodes } from '../../algoan/dto/analysis.enum';

/**
 * Hook service
 */
@Injectable()
export class HooksService {
  constructor(
    @Inject(CONFIG) private readonly config: Config,
    private readonly algoanHttpService: AlgoanHttpService,
    private readonly algoanCustomerService: AlgoanCustomerService,
    private readonly algoanAnalysisService: AlgoanAnalysisService,
    private readonly tinkHttpService: TinkHttpService,
    private readonly tinkLinkService: TinkLinkService,
    private readonly tinkUserService: TinkUserService,
    private readonly tinkAccountService: TinkAccountService,
    private readonly tinkProviderService: TinkProviderService,
    private readonly tinkTransactionService: TinkTransactionService,
    private readonly serviceAccount: ServiceAccount,
  ) {}

  /**
   * Handle Aggregator Link event
   */
  public async handleAggregatorLinkRequiredEvent(payload: AggregatorLinkRequiredDTO): Promise<void> {
    // Authenticate to algoan
    this.algoanHttpService.authenticate(this.serviceAccount.clientId, this.serviceAccount.clientSecret);

    // Get user information and client config
    const customer: Customer = await this.algoanCustomerService.getCustomerById(payload.customerId);
    // Ignore query params since Tink does not accept variables
    const callbackUrl: string | undefined = customer.aggregationDetails.callbackUrl?.split(/[?#]/)[0];
    const clientConfig: ClientConfig | undefined = this.serviceAccount.config as ClientConfig | undefined;

    // Validate config
    if (callbackUrl === undefined || clientConfig === undefined) {
      throw new Error(
        `Missing information: callbackUrl: ${callbackUrl}, clientConfig: ${JSON.stringify(clientConfig)}`,
      );
    }
    assertsTypeValidation(ClientConfig, clientConfig);

    let tinkUserId: string | undefined;
    let authorizationCode: string | undefined;

    // if premium pricing
    if (clientConfig.pricing === ClientPricing.PREMIUM) {
      // Get the saved tink user id from algoan customer
      tinkUserId = customer.aggregationDetails.userId;

      // Authenticate to tink
      await this.tinkHttpService.authenticateAsClientWithCredentials(clientConfig.clientId, clientConfig.clientSecret);

      // If no tink user already created
      if (tinkUserId === undefined) {
        // Create tink user
        const user: CreateUserObject = await this.tinkUserService.createNewUser({
          external_user_id: customer.id,
          locale: clientConfig.locale,
          market: clientConfig.market,
        });

        tinkUserId = user.user_id;
      }

      // Get an authorization code
      authorizationCode = await this.tinkUserService.delegateAuthorizationToUser({
        user_id: tinkUserId,
        scope: [
          'user:read', // Read the user
          'authorization:read', // Auth
          'authorization:grant', // Auth
          'credentials:read', // Auth
          'credentials:write', // Auth
          'providers:read', // List providers in tink link
        ].join(','),
        id_hint: customer.customIdentifier,
        actor_client_id: TINK_LINK_ACTOR_CLIENT_ID,
      });
    }

    const linkData: CustomerUpdateInput['aggregationDetails'] = this.generateLinkDataFromAggregationMode(
      customer.aggregationDetails.mode,
      { clientConfig, callbackUrl, authorizationCode },
    );

    // Update user with redirect link information and userId if provided
    await this.algoanCustomerService.updateCustomer(payload.customerId, {
      aggregationDetails: {
        ...linkData,
        userId: tinkUserId,
      },
    });

    return;
  }

  /**
   * Returns the correct link according to the aggregation mode.
   * @param mode aggregation mode
   * @param data the input data used for to generate the link data
   * @returns
   */
  private generateLinkDataFromAggregationMode(
    mode: AggregationDetailsMode | undefined,
    data: { clientConfig: ClientConfig; callbackUrl: string; authorizationCode?: string },
  ): CustomerUpdateInput['aggregationDetails'] {
    const { clientConfig, callbackUrl, authorizationCode } = data;
    const sharedLinkParameters: AccountCheckArgs = {
      client_id: clientConfig.clientId,
      redirect_uri: callbackUrl,
      market: clientConfig.market,
      locale: clientConfig.locale,
      test: this.config.tink.test ?? false,
      scope: [
        'accounts:read', // To list account: https://docs.tink.com/api#account-list-accounts-required-scopes-
        'transactions:read', // To list transactions: https://docs.tink.com/api#search-query-transactions-required-scopes-
        'credentials:read', // To list providers: https://docs.tink.com/api#provider-list-providers-required-scopes-
      ].join(','),
      authorization_code: authorizationCode,
    };

    switch (mode) {
      case AggregationDetailsMode.redirect:
        const redirectUrl: string | undefined = this.tinkLinkService.getAuthorizeLink(sharedLinkParameters);

        return { redirectUrl };
      case AggregationDetailsMode.iframe:
        const iframeUrl: string | undefined = this.tinkLinkService.getAuthorizeLink({
          ...sharedLinkParameters,
          iframe: true,
        });

        return { iframeUrl };

      default:
        throw new Error(`Invalid bank connection mode ${mode}`);
    }
  }

  /**
   * Handle Aggregator Link event
   */
  public async handleBankDetailsRequiredEvent(payload: BankDetailsRequiredDTO): Promise<void> {
    try {
      // Get client config
      const clientConfig: ClientConfig | undefined = this.serviceAccount.config as ClientConfig | undefined;

      // Authenticate to algoan
      this.algoanHttpService.authenticate(this.serviceAccount.clientId, this.serviceAccount.clientSecret);

      // Validate config
      if (clientConfig === undefined) {
        throw new Error(`Missing information: clientConfig: undefined`);
      }
      assertsTypeValidation(ClientConfig, clientConfig);

      if (payload.temporaryCode === undefined) {
        // Refresh mode — Authenticate to tink with a refresh token from the customer
        const customer: Customer = await this.algoanCustomerService.getCustomerById(payload.customerId);

        if (customer.aggregationDetails?.token !== undefined) {
          await this.tinkHttpService.authenticateAsClientWithRefreshToken(
            clientConfig.clientId,
            clientConfig.clientSecret,
            customer.aggregationDetails.token,
          );
        } else {
          throw new Error(
            `Missing information: customer.aggregationDetails.token: undefined for ${payload.customerId}`,
          );
        }
      } else {
        // Snapshot mode — Authenticate to tink as a user
        await this.tinkHttpService.authenticateAsUserWithCode(
          clientConfig.clientId,
          clientConfig.clientSecret,
          payload.temporaryCode,
        );

        const aggregationDetails: AggregationDetails = { token: this.tinkHttpService.getRefreshToken() };
        await this.algoanCustomerService.updateCustomer(payload.customerId, { aggregationDetails });
      }

      // Get bank information
      const accounts: TinkAccountObject[] = await this.tinkAccountService.getAccounts();
      const transactions: ExtendedTinkTransactionResponseObject[] = await this.tinkTransactionService.getTransactions({
        accounts: accounts.map((a: TinkAccountObject) => a.id),
      });
      const providers: TinkProviderObject[] = await this.tinkProviderService.getProviders();

      // Generate an Algoan analysis from data information
      const analysis: AnalysisUpdateInput = mapTinkDataToAlgoanAnalysis(accounts, transactions, providers);

      // Update the user analysis
      await this.algoanAnalysisService.updateAnalysis(payload.customerId, payload.analysisId, analysis);

      return;
    } catch (err) {
      // Update the analysis error
      await this.algoanAnalysisService.updateAnalysis(payload.customerId, payload.analysisId, {
        status: AnalysisStatus.ERROR,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: `An error occured when fetching data from the aggregator`,
        },
      });

      throw err;
    }
  }
}
