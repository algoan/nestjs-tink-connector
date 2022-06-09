import { TinkV2TransactionObject } from './transaction-v2.object';
import { TinkV2Mutability, TinkV2TransactionStatus, TinkV2TransactionType } from './transaction-v2.enum';
import { tinkV2AccountObjectMock } from './account-v2.object.mock';

export const tinkV2TransactionObjectMock: TinkV2TransactionObject = {
  accountId: '4a2945d1481c4f4b98ab1b135afd96c0',
  amount: {
    currencyCode: 'GBP',
    value: {
      scale: '1',
      unscaledValue: '-1300',
    },
  },
  categories: {
    pfm: {
      id: 'd8f37f7d19c240abb4ef5d5dbebae4ef',
      name: '',
    },
  },
  dates: {
    booked: '2020-12-15',
    value: '2020-12-15',
  },
  descriptions: {
    display: 'Tesco',
    original: 'TESCO STORES 3297',
  },
  id: tinkV2AccountObjectMock.id,
  identifiers: {
    providerTransactionId: '500015d3-acf3-48cc-9918-9e53738d3692',
  },
  merchantInformation: {
    merchantCategoryCode: 'string',
    merchantName: 'string',
  },
  providerMutability: TinkV2Mutability.MUTABILITY_UNDEFINED,
  reference: 'string',
  status: TinkV2TransactionStatus.BOOKED,
  types: {
    financialInstitutionTypeCode: 'DEB',
    type: TinkV2TransactionType.DEFAULT,
  },
};
