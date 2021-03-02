import { IsNotEmpty } from 'class-validator';
import { EventName, SubscriptionStatus } from '@algoan/rest';

/**
 * Subscription
 */
export class SubscriptionDTO {
  @IsNotEmpty()
  public readonly id: string;
  @IsNotEmpty()
  public readonly target: string;
  @IsNotEmpty()
  public readonly eventName: EventName;
  @IsNotEmpty()
  public readonly status: SubscriptionStatus;
}
