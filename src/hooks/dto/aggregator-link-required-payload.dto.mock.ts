import { customerMock } from '../../algoan/dto/customer.objects.mock';

import { AggregatorLinkRequiredDTO } from './aggregator-link-required-payload.dto';

/**
 * Mock for a payload
 */
export const aggregatorLinkRequiredMock: AggregatorLinkRequiredDTO = {
  customerId: customerMock.id,
};
