import { Type } from 'class-transformer';
import { Allow, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

import { PayloadDTO } from './payload.dto';
import { SubscriptionDTO } from './subscription.dto';


/**
 * Event
 */
export class EventDTO {
  @ValidateNested()
  @Type(() => SubscriptionDTO)
  public readonly subscription: SubscriptionDTO;
  @Allow()
  public readonly payload: PayloadDTO;
  @IsInt()
  public readonly index: number;
  @IsOptional()
  @IsInt()
  public readonly time: number;

  @IsNotEmpty()
  public readonly id: string;
}
