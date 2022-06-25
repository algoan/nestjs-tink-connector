import { TinkTransactionCategoryType, TinkTransactionType } from './transaction.enums';

/**
 * Search response
 *
 * Only feed needed
 *
 * @link https://docs.tink.com/api#search-query-transactions-response-searchresponse
 */
export interface TinkSearchResponseObject<NullOrUndefined = undefined> {
  count: number;
  results: TinkSearchResultObject<NullOrUndefined>[];
}

/**
 * Search result
 *
 * Only feed needed
 *
 * @link https://docs.tink.com/api#search-query-transactions-response-searchresponse-searchresult
 */
export interface TinkSearchResultObject<NullOrUndefined = undefined> {
  transaction: TinkTransactionResponseObject<NullOrUndefined>;
}

/**
 * Transaction response
 *
 * Only feed needed
 *
 * @link https://docs.tink.com/api#search-query-transactions-response-searchresponse-transactionresponse
 */
export interface TinkTransactionResponseObject<NullOrUndefined = undefined> {
  id: string;
  accountId: string;
  amount: number;
  categoryId: string;
  categoryType: TinkTransactionCategoryType;
  currencyDenominatedOriginalAmount: TinkCurrencyDenominatedAmountObject | NullOrUndefined;
  originalDate: number; // timestamp
  originalDescription: string;
  type: TinkTransactionType;
  upcoming: boolean | NullOrUndefined;
}

/**
 * Extends Tink transaction with the category code
 */
export type ExtendedTinkTransactionResponseObject<NullOrUndefined = undefined> =
  TinkTransactionResponseObject<NullOrUndefined> & {
    categoryCode?: string;
  };

/**
 * Currency Denominated Amount Object
 *
 * Only feed needed
 *
 * @link https://docs.tink.com/api#search-query-transactions-response-searchresponse-currencydenominatedamount
 */
export interface TinkCurrencyDenominatedAmountObject {
  currencyCode: string; // ISO 4217
}
