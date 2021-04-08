import { EventName } from '@algoan/rest';
import { SubscriptionDTO } from './subscription.dto';

/**
 * Mock for a Subscription
 */
export const subscriptionMock: SubscriptionDTO = {
  id: 'id',
  target: 'https://target.url',
  eventName: EventName.BANKREADER_REQUIRED,
  status: 'ACTIVE',
};
