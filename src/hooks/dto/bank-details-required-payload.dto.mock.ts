import { customerMock } from '../../algoan/dto/customer.objects.mock';

import { BankDetailsRequiredDTO } from './bank-details-required-payload.dto';

/**
 * Mock for a payload
 */
export const bankDetailsRequiredMock: BankDetailsRequiredDTO = {
  customerId: customerMock.id,
  analysisId: '12345678910',
  temporaryCode: '12345678910',
};
