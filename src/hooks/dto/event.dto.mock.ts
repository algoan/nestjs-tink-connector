import { EventDTO } from './event.dto';
import { aggregatorLinkRequiredMock } from './aggregator-link-required-payload.dto.mock';

import { subscriptionMock } from './subscription.dto.mock';

/**
 * Event
 */
export const eventMock: EventDTO = {
  subscription: subscriptionMock,
  payload: aggregatorLinkRequiredMock,
  time: 12345678910,
  index: 1,
  id: 'id',
};
