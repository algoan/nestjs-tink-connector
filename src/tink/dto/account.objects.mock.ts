/* eslint-disable @typescript-eslint/naming-convention */
import { TinkAccountType } from './account.enums';
import {
  TinkAccountObject,
  TinkAccountCurrencyDenominatedBalanceObject,
  TinkAccountListResponseObject,
} from './account.objects';
import { tinkProviderObjectMock } from './provider.objects.mock';

/**
 * Mock for a Tink Account Currency Denominated Balance
 */
export const tinkAccountCurrencyDenominatedBalanceObjectMock: TinkAccountCurrencyDenominatedBalanceObject = {
  currencyCode: 'EUR',
};

/**
 * Mock for a Tink account
 */
export const tinkAccountObjectMock: TinkAccountObject = {
  // eslint-disable-next-line no-magic-numbers
  id: 'a6bb87e57a8c4dd4874b241471a2b9e8',
  balance: 34567.5,
  credentialsId: '6e68cc6287704273984567b3300c5822',
  currencyDenominatedBalance: tinkAccountCurrencyDenominatedBalanceObjectMock,
  financialInstitutionId: tinkProviderObjectMock.financialInstitutionId,
  identifiers: '["iban://BOUSFRPPXXX/FR7640618802800004063675660"]',
  holderName: 'Thomas Alan Waits',
  name: 'My account',
  type: TinkAccountType.CHECKING,
  accountNumber: '1234-123456789',
};

/**
 * Mock for a Tink Account List Response
 */
export const tinkAccountListResponseObjectMock: TinkAccountListResponseObject = {
  accounts: [tinkAccountObjectMock],
};
