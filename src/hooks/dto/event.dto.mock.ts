import { EventDTO } from './event.dto';
import { payloadMock } from './payload.dto.mock';

import { subscriptionMock } from './subscription.dto.mock';

/**
 * Event
 */
export const eventMock: EventDTO = {
  subscription: subscriptionMock,
  payload: payloadMock,
  time: 12345678910,
  index: 1,
  id: 'id',
};
