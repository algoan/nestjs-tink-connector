import { Type } from 'class-transformer';
import { Allow, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

import { ServiceAccountCreatedDTO } from './service-account-created.dto';
import { ServiceAccountDeletedDTO } from './service-account-deleted.dto';
import { SubscriptionDTO } from './subscription.dto';

/**
 * Events payload types
 */
type Events = ServiceAccountCreatedDTO | ServiceAccountDeletedDTO;

/**
 * Event
 */
export class EventDTO {
  @ValidateNested()
  @Type(() => SubscriptionDTO)
  public readonly subscription: SubscriptionDTO;
  @Allow()
  public readonly payload: Events;
  @IsInt()
  public readonly index: number;
  @IsOptional()
  @IsInt()
  public readonly time: number;

  @IsNotEmpty()
  public readonly id: string;
}
