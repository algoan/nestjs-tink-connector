/* eslint-disable @typescript-eslint/naming-convention, camelcase */
import { ServiceAccount } from '@algoan/rest';
import { Injectable, Inject } from '@nestjs/common';
import { Config } from 'node-config-ts';

import { assertsTypeValidation } from '../../shared/utils/common.utils';
import { TinkAccountObject } from '../../tink/dto/account.objects';
import { TinkAccountService } from '../../tink/services/tink-account.service';
import { TinkProviderService } from '../../tink/services/tink-provider.service';
import { TinkTransactionService } from '../../tink/services/tink-transaction.service';
import { TinkProviderObject } from '../../tink/dto/provider.objects';
import { TinkTransactionResponseObject } from '../../tink/dto/search.objects';
import { AnalysisUpdateInput } from '../../algoan/dto/analysis.inputs';
import { TINK_LINK_ACTOR_CLIENT_ID } from '../../tink/contstants/tink.constants';
import { Customer } from '../../algoan/dto/customer.objects';
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
    const callbackUrl: string | undefined = customer.aggregationDetails.callbackUrl;
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

    // Generate the link
    const redirectUrl: string = this.tinkLinkService.getAuthorizeLink({
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
    });

    // Update user with redirect link information and userId if provided
    await this.algoanCustomerService.updateCustomer(payload.customerId, {
      aggregationDetails: {
        redirectUrl,
        userId: tinkUserId,
      },
    });

    return;
  }

  /**
   * Handle Aggregator Link event
   */
  public async handleBankDetailsRequiredEvent(payload: BankDetailsRequiredDTO): Promise<void> {
    // Get client config
    const clientConfig: ClientConfig | undefined = this.serviceAccount.config as ClientConfig | undefined;

    // Validate config
    if (clientConfig === undefined) {
      throw new Error(`Missing information: clientConfig: undefined`);
    }
    assertsTypeValidation(ClientConfig, clientConfig);

    // Authenticate to tink as a user
    await this.tinkHttpService.authenticateAsUserWithCode(
      clientConfig.clientId,
      clientConfig.clientSecret,
      payload.temporaryCode,
    );

    // Get bank information
    const accounts: TinkAccountObject[] = await this.tinkAccountService.getAccounts();
    const transactions: TinkTransactionResponseObject[] = await this.tinkTransactionService.getTransactions({
      accounts: accounts.map((a: TinkAccountObject) => a.id),
    });
    const providers: TinkProviderObject[] = await this.tinkProviderService.getProviders();

    // Generate an Algoan analysis from data information
    const analysis: AnalysisUpdateInput = mapTinkDataToAlgoanAnalysis(accounts, transactions, providers);

    // Authenticate to algoan
    this.algoanHttpService.authenticate(this.serviceAccount.clientId, this.serviceAccount.clientSecret);

    // Update the user analysis
    await this.algoanAnalysisService.updateAnalysis(payload.customerId, payload.analysisId, analysis);

    return;
  }
}
