/* eslint-disable @typescript-eslint/naming-convention, camelcase */
import { EventName, EventStatus, ServiceAccount, Subscription, SubscriptionEvent } from '@algoan/rest';
import { UnauthorizedException, Injectable, Inject } from '@nestjs/common';
import { Config } from 'node-config-ts';

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
import { AlgoanHttpService } from '../../algoan/services/algoan-http.service';
import { EventDTO } from '../dto/event.dto';
import { PayloadDTO } from '../dto/payload.dto';

/**
 * Hook service
 */
@Injectable()
export class HooksService {
  constructor(
    @Inject(CONFIG) private readonly config: Config,
    private readonly algoanService: AlgoanService,
    private readonly algoanHttpService: AlgoanHttpService,
    private readonly algoanCustomerService: AlgoanCustomerService,
    private readonly tinkLinkService: TinkLinkService,
    private readonly tinkUserService: TinkUserService,
    private readonly tinkHttpService: TinkHttpService,
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
          await this.handleAggregatorLinkRequiredEvent(serviceAccount, event.payload);
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
  public async handleAggregatorLinkRequiredEvent(serviceAccount: ServiceAccount, payload: PayloadDTO): Promise<void> {
    // Authenticate to algoan
    this.algoanHttpService.authenticate(serviceAccount.clientId, serviceAccount.clientSecret);

    // Get user information
    const customer: Customer = await this.algoanCustomerService.getCustomerById(payload.customerId);
    const callbackUrl: string | undefined = customer.aggregationDetails.callbackUrl;
    const clientConfig: ClientConfig | undefined = (serviceAccount.config as ClientConfig | undefined);

    if (callbackUrl === undefined || clientConfig === undefined) {
      throw new Error(`Missing information: callbackUrl: ${callbackUrl}, clientConfig: ${JSON.stringify(clientConfig)}`);
    }

    let redirectUrl: string;
    let tinkUserId: string | undefined;

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
      const authorizationCode: string = await this.tinkUserService.delegateAuthorizationToUser({
        user_id: tinkUserId,
        scope: 'credentials:read,credentials:refresh,credentials:write,providers:read,user:read,authorization:read',
        id_hint: customer.customIdentifier,
        actor_client_id: clientConfig.clientId,
      });

      // Generate the link with the authorization code
      redirectUrl = this.tinkLinkService.getLink({
        client_id: clientConfig.clientId,
        redirect_uri: callbackUrl,
        market: clientConfig.market,
        locale: clientConfig.locale,
        test: this.config.tink.test ?? false,
        scope: 'accounts:read,transactions:read,identity:read',
        authorization_code: authorizationCode,
      });
    } else {
      // Generate a simple link
      redirectUrl = this.tinkLinkService.getLink({
        client_id: clientConfig.clientId,
        redirect_uri: callbackUrl,
        market: clientConfig.market,
        locale: clientConfig.locale,
        scope: 'accounts:read,transactions:read',
        test: this.config.tink.test ?? false,
      });
    }

    // Update user with redirect link information and userId if provided
    await this.algoanCustomerService.updateCustomer(
      payload.customerId,
      {
        aggregationDetails: {
          redirectUrl,
          userId: tinkUserId,
        }
      }
    )

    return;
  }
}
