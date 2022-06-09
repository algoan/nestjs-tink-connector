import { TinkV2Mutability, TinkV2TransactionStatus, TinkV2TransactionType } from './transaction-v2.enum';
import { TinkV2CurrencyDenominatedAmountObject } from './account-v2.object';

/**
 * Query parameters used in the Tink V2 request GET /data/v2/transactions
 */
export interface TinkV2GetTransactionsQueryParameters {
  pageSize?: number;
  pageToken?: string;
  accountIdIn?: string | string[];
  statusIn?: TinkV2TransactionStatus | TinkV2TransactionStatus[];
}

/**
 * Response of Tink V2 request GET /data/v2/transactions
 */
export interface TinkV2GetTransactionsResponseObject<NullOrUndefined = undefined> {
  nextPageToken: string;
  transactions: TinkV2TransactionObject[];
}

/**
 * Tink V2 Transaction
 */
export interface TinkV2TransactionObject<NullOrUndefined = undefined> {
  accountId: string;
  amount: TinkV2CurrencyDenominatedAmountObject;
  bookedDateTime?: string;
  categories?: TinkV2CategoriesObject;
  dates?: TinkV2TransactionDatesObject;
  descriptions?: TinkV2DescriptionsObject;
  id: string;
  identifiers?: TinkV2TransactionIdentifiersObject;
  merchantInformation?: TinkV2MerchantInformationObject;
  providerMutability?: TinkV2Mutability;
  reference?: string;
  status: TinkV2TransactionStatus;
  transactionDateTime?: string;
  types: TinkV2TransactionTypesObject;
  valueDateTime?: string;
}

/**
 * Tink V2 Transaction Categories
 */
interface TinkV2CategoriesObject<NullOrUndefined = undefined> {
  pfm?: TinkV2PFMCategoryObject;
}

/**
 * Tink V2 PFM Category
 */
interface TinkV2PFMCategoryObject<NullOrUndefined = undefined> {
  id: string;
  name: string;
}

/**
 * Tink V2 Transaction Descriptions
 */
interface TinkV2DescriptionsObject<NullOrUndefined = undefined> {
  display: string;
  original: string;
}

/**
 * Tink V2 Transaction Identifiers
 */
interface TinkV2TransactionIdentifiersObject<NullOrUndefined = undefined> {
  providerTransactionId?: string;
}

/**
 * Tink V2 Merchant Information
 */
interface TinkV2MerchantInformationObject<NullOrUndefined = undefined> {
  merchantCategoryCode?: string;
  merchantName?: string;
}

/**
 * Tink V2 Transaction Types
 */
interface TinkV2TransactionTypesObject<NullOrUndefined = undefined> {
  financialInstitutionTypeCode?: string;
  type: TinkV2TransactionType;
}

/**
 * Tink V2 Transaction Dates
 */
interface TinkV2TransactionDatesObject<NullOrUndefiend = undefined> {
  booked?: string;
  value?: string;
}
