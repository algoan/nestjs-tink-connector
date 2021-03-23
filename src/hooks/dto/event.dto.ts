import { Type } from 'class-transformer';
import { Allow, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

import { AggregatorLinkRequiredDTO } from './aggregator-link-required-payload.dto';
import { BankDetailsRequiredDTO } from './bank-details-required-payload.dto';
import { SubscriptionDTO } from './subscription.dto';

/**
 * Events payload types
 */
type EventPayloadDTO = AggregatorLinkRequiredDTO | BankDetailsRequiredDTO;

/**
 * Event
 */
export class EventDTO {
  @ValidateNested()
  @Type(() => SubscriptionDTO)
  public readonly subscription: SubscriptionDTO;
  @Allow()
  public readonly payload: EventPayloadDTO;
  @IsInt()
  public readonly index: number;
  @IsOptional()
  @IsInt()
  public readonly time: number;

  @IsNotEmpty()
  public readonly id: string;
}
