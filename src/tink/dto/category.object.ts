import { TinkTransactionCategoryType } from './transaction.enums';

/**
 * Tink category object
 * Can be retrieved here: https://docs.tink.com/api#category
 */
export interface TinkCategory {
  code: string;
  defaultChild: boolean;
  id: string;
  parent: string;
  primaryName: string;
  searchTerms: string | null;
  secondaryName: string;
  sortOrder: number;
  type: TinkTransactionCategoryType;
  typeName: string;
}
