import { EventName, EventStatus, ServiceAccount, Subscription, SubscriptionEvent } from '@algoan/rest';
import { Body, Controller, Headers, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';

import { assertsTypeValidation } from '../../shared/utils/common.utils';
import { AggregatorLinkRequiredDTO } from '../dto/aggregator-link-required-payload.dto';
import { BankDetailsRequiredDTO } from '../dto/bank-details-required-payload.dto';

import { EventDTO } from '../dto/event.dto';
import { HooksService } from '../services/hooks.service';
/**
 * Headers interface
 */
interface IHeaders {
  'x-hub-signature': string;
}

/**
 * Hooks controller
 */
@Controller()
export class HooksController {
  constructor(private readonly hooksService: HooksService, private readonly serviceAccount: ServiceAccount) {}

  /**
   * Hooks route
   */
  @Post('/hooks')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async controlHook(@Body() event: EventDTO, @Headers() headers: IHeaders): Promise<void> {
    // Get subscription
    const subscription: Subscription | undefined = this.serviceAccount.subscriptions.find(
      (sub: Subscription) => sub.id === event.subscription.id,
    );

    if (subscription === undefined) {
      return;
    }

    // Check message signature
    const signature: string = headers['x-hub-signature'];
    if (!subscription.validateSignature(signature, (event.payload as unknown) as { [key: string]: string })) {
      throw new UnauthorizedException('Invalid X-Hub-Signature: you cannot call this API');
    }

    // To acknowledge the subscription event
    const se: SubscriptionEvent = subscription.event(event.id);

    try {
      switch (event.subscription.eventName) {
        case EventName.AGGREGATOR_LINK_REQUIRED:
          assertsTypeValidation(AggregatorLinkRequiredDTO, event.payload);
          void this.hooksService.handleAggregatorLinkRequiredEvent(event.payload).catch((err) => {
            throw err;
          });
          break;

        case EventName.BANK_DETAILS_REQUIRED:
          assertsTypeValidation(BankDetailsRequiredDTO, event.payload);
          void this.hooksService.handleBankDetailsRequiredEvent(event.payload).catch((err) => {
            throw err;
          });
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
  }
}
