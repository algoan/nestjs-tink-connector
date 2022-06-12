import { TinkV2AccountObject } from './account-v2.object';
import { TinkV2AccountType, TinkV2CustomerSegment } from './account-v2.enum';

export const tinkV2AccountObjectMock: TinkV2AccountObject = {
  balances: {
    booked: {
      amount: {
        currencyCode: 'EUR',
        value: {
          scale: '-3',
          unscaledValue: '19',
        },
      },
    },
  },
  customerSegment: TinkV2CustomerSegment.UNDEFINED_CUSTOMER_SEGMENT,
  dates: {
    lastRefreshed: '2020-12-15T12:16:58Z',
  },
  financialInstitutionId: '6e68cc6287704273984567b3300c5822',
  id: 'ee7ddbd178494220bb184791783f4f63',
  identifiers: {
    financialInstitution: {
      accountNumber: 'SE6930000000011273547693',
    },
    iban: {
      bban: '0000011273547693',
      iban: 'SE6930000000011273547693',
    },
    pan: {
      masked: '4000 12** **** 9010',
    },
  },
  name: 'PERSONKONTO',
  type: TinkV2AccountType.CHECKING,
};
