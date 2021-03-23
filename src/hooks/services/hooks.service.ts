/* eslint-disable @typescript-eslint/naming-convention, camelcase */
import { EventName, EventStatus, ServiceAccount, Subscription, SubscriptionEvent } from '@algoan/rest';
import { UnauthorizedException, Injectable, Inject } from '@nestjs/common';
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
import { AlgoanService } from '../../algoan/services/algoan.service';
import { AlgoanAnalysisService } from '../../algoan/services/algoan-analysis.service';
import { AlgoanHttpService } from '../../algoan/services/algoan-http.service';
import { EventDTO } from '../dto/event.dto';
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
    private readonly algoanService: AlgoanService,
    private readonly algoanCustomerService: AlgoanCustomerService,
    private readonly algoanAnalysisService: AlgoanAnalysisService,
    private readonly tinkHttpService: TinkHttpService,
    private readonly tinkLinkService: TinkLinkService,
    private readonly tinkUserService: TinkUserService,
    private readonly tinkAccountService: TinkAccountService,
    private readonly tinkProviderService: TinkProviderService,
    private readonly tinkTransactionService: TinkTransactionService,
  ) {}

  /**
   * Handle Algoan webhooks
   * @param event Event listened to
   * @param signature Signature headers, to check if the call is from Algoan
   */
  public async handleWebhook(event: EventDTO, signature: string): Promise<void> {
    const subScriptionId: string | undefined = event.subscription.id;

    const serviceAccount: ServiceAccount | undefined = this.algoanService.algoanClient
      .getServiceAccountBySubscriptionId(subScriptionId);

    if (serviceAccount === undefined) {
      throw new UnauthorizedException(`No service account found for subscription ${subScriptionId}`);
    }

    const subscription: Subscription | undefined = serviceAccount.subscriptions.find(
      (sub: Subscription) => sub.id === event.subscription.id,
    );

    if (subscription === undefined) {
      return;
    }

    if (!subscription.validateSignature(signature, (event.payload as unknown) as { [key: string]: string })) {
      throw new UnauthorizedException('Invalid X-Hub-Signature: you cannot call this API');
    }

    // Handle the event asynchronously
    void this.dispatchAndHandleWebhook(serviceAccount, event, subscription);

    return;
  }

  /**
   * Dispatch to the right webhook handler and handle
   *
   * Allow to asynchronously handle (with `void`) the webhook and firstly respond 204 to the server
   */
  private async dispatchAndHandleWebhook(
    serviceAccount: ServiceAccount,
    event: EventDTO,
    subscription: Subscription,
  ): Promise<void> {
    // Acknowledge the subscription event
    const se: SubscriptionEvent = subscription.event(event.id);

    try {
      switch (event.subscription.eventName) {
        case EventName.AGGREGATOR_LINK_REQUIRED:
          assertsTypeValidation(AggregatorLinkRequiredDTO, event.payload);
          await this.handleAggregatorLinkRequiredEvent(serviceAccount, event.payload);
          break;

        case EventName.BANK_DETAILS_REQUIRED:
          assertsTypeValidation(BankDetailsRequiredDTO, event.payload);
          await this.handleBankDetailsRequiredEvent(serviceAccount, event.payload);
          break;

        // The default case should never be reached, as the eventName is already checked in the DTO
        default:
          void se.update({ status: EventStatus.FAILED });

          return;
      }
    } catch (err) {
      void se.update({ status: EventStatus.ERROR });

      throw err;
    }

    void se.update({ status: EventStatus.PROCESSED });
  };

  /**
   * Handle Aggregator Link event
   */
  public async handleAggregatorLinkRequiredEvent(
    serviceAccount: ServiceAccount,
    payload: AggregatorLinkRequiredDTO
  ): Promise<void> {
    // Authenticate to algoan
    this.algoanHttpService.authenticate(serviceAccount.clientId, serviceAccount.clientSecret);

    // Get user information and client config
    const customer: Customer = await this.algoanCustomerService.getCustomerById(payload.customerId);
    const callbackUrl: string | undefined = customer.aggregationDetails.callbackUrl;
    const clientConfig: ClientConfig | undefined = (serviceAccount.config as ClientConfig | undefined);

    // Validate config
    if (callbackUrl === undefined || clientConfig === undefined) {
      throw new Error(`Missing information: callbackUrl: ${callbackUrl}, clientConfig: ${JSON.stringify(clientConfig)}`);
    }
    assertsTypeValidation(ClientConfig, clientConfig);

    let tinkUserId: string | undefined;
    let authorizationCode: string | undefined;

    // if premium pricing
    if (clientConfig.pricing === ClientPricing.PREMIUM) {

      // Get the saved tink user id from algoan customer
      tinkUserId = customer.aggregationDetails.userId;

      // Authenticate to tink
      await this.tinkHttpService.authenticateAsClientWithCredentials(clientConfig.clientId, clientConfig.clientSecret)

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
    await this.algoanCustomerService.updateCustomer(
      payload.customerId,
      {
        aggregationDetails: {
          redirectUrl,
          userId: tinkUserId,
        }
      }
    );

    return;
  }

  /**
   * Handle Aggregator Link event
   */
  public async handleBankDetailsRequiredEvent(
    serviceAccount: ServiceAccount,
    payload: BankDetailsRequiredDTO,
  ): Promise<void> {
    // Get client config
    const clientConfig: ClientConfig | undefined = (serviceAccount.config as ClientConfig | undefined);

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
    const transactions: TinkTransactionResponseObject[] = await this.tinkTransactionService
      .getTransactions({
        accounts: accounts.map((a: TinkAccountObject) => a.id),
      });
    const providers: TinkProviderObject[] = await this.tinkProviderService.getProviders();

    // Generate an Algoan analysis from data information
    const analysis: AnalysisUpdateInput = mapTinkDataToAlgoanAnalysis(accounts, transactions, providers);

    // Authenticate to algoan
    this.algoanHttpService.authenticate(serviceAccount.clientId, serviceAccount.clientSecret);

    // Update the user analysis
    await this.algoanAnalysisService.updateAnalysis(
      payload.customerId,
      payload.analysisId,
      analysis
    );

    return;
  }
}
