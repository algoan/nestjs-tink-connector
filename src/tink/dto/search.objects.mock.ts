/* eslint-disable no-magic-numbers */
import { tinkAccountObjectMock } from './account.objects.mock';
import { TinkSearchResponseObject } from './search.objects';
import { TinkTransactionCategoryType, TinkTransactionType } from './transaction.enums';

/**
 * Search response
 */
export const tinkSearchResponseObjectMock: TinkSearchResponseObject = {
  count: 110,
  results: [
    {
      transaction: {
        id: '79c6c9c27d6e42489e888e08d27205a1',
        accountId: tinkAccountObjectMock.id,
        amount: 34.5,
        categoryType: TinkTransactionCategoryType.EXPENSES,
        currencyDenominatedOriginalAmount: {
          currencyCode: 'EUR',
        },
        originalDate: 1455740874875,
        originalDescription: 'Stadium Sergelg Stockholm',
        type: TinkTransactionType.CREDIT_CARD,
        upcoming: false,
      },
    },
  ],
};
