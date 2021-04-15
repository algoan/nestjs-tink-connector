import { TinkCategory } from './category.object';
import { TinkTransactionCategoryType } from './transaction.enums';

export const tinkCategoryListMock: TinkCategory[] = [
  {
    code: 'expenses:house.other',
    defaultChild: true,
    id: '01f944531ab04cd3ba32a14cebe8a927',
    parent: '9308a083665741588b88d9160aedf968',
    primaryName: 'Home Improvements',
    // eslint-disable-next-line no-null/no-null
    searchTerms: null,
    secondaryName: 'Home Improvements Other',
    sortOrder: 14,
    type: TinkTransactionCategoryType.EXPENSES,
    typeName: 'Expenses',
  },
  {
    code: 'expenses:misc.outlays',
    defaultChild: false,
    id: '0217989903af43c5b7b4e66c0515d0d5',
    parent: '99dd6d0c05a347d1858daa219e21c573',
    primaryName: 'Other',
    // eslint-disable-next-line no-null/no-null
    searchTerms: null,
    secondaryName: 'Business Expenses',
    sortOrder: 49,
    type: TinkTransactionCategoryType.EXPENSES,
    typeName: 'Expenses',
  },
];
