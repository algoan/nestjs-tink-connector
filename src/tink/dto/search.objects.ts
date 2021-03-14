import { TinkTransactionCategoryType, TinkTransactionType } from "./transaction.enums"

/**
 * Search response
 *
 * Only feed needed
 *
 * @link https://docs.tink.com/api#search-query-transactions-response-searchresponse
 */
export interface TinkSearchResponseObject {
  count: number;
  results: TinkSearchResultObject[];
}


/**
 * Search result
 *
 * Only feed needed
 *
 * @link https://docs.tink.com/api#search-query-transactions-response-searchresponse-searchresult
 */
 export interface TinkSearchResultObject {
  transaction: TinkTransactionResponseObject,
}

/**
 * Transaction response
 *
 * Only feed needed
 *
 * @link https://docs.tink.com/api#search-query-transactions-response-searchresponse-transactionresponse
 */
 export interface TinkTransactionResponseObject {
  id: string;
  accountId: string;
  amount: number;
  categoryType: TinkTransactionCategoryType;
  currencyDenominatedOriginalAmount?: TinkCurrencyDenominatedAmountObject;
  originalDate: number; // timestamp
  originalDescription: string;
  type: TinkTransactionType;
  upcoming?: boolean,
}



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
