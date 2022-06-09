import { TinkV2AccountType, TinkV2CustomerSegment } from './account-v2.enum';

/**
 * Query parameters used in the Tink request GET /data/v2/accounts
 */
export interface TinkV2GetAccountsQueryParameters {
  pageSize?: number;
  pageToken?: string;
  typesIn?: TinkV2AccountType | TinkV2AccountType[];
}

/**
 * Response of the Tink request GET /data/v2/accounts
 *
 * @link https://docs.tink.com/api#data-v2/account/list-accounts
 */
export interface TinkV2GetAccountsResponseObject<NullOrUndefined = undefined> {
  accounts: TinkV2AccountObject<NullOrUndefined>[];
  nextPageToken: string;
}

/**
 * Tink V2 Account
 */
export interface TinkV2AccountObject<NullOrUndefined = undefined> {
  balances?: TinkV2BalancesObject;
  customerSegment?: TinkV2CustomerSegment;
  dates: TinkV2AccountDatesObject;
  financialInstitutionId?: string;
  id: string;
  identifiers?: TinkV2AccountIdentifiersObject;
  name: string;
  type: TinkV2AccountType;
}

/**
 * Tink V2 Balances
 */
interface TinkV2BalancesObject<NullOrUndefined = undefined> {
  available?: TinkV2BalanceObject;
  booked?: TinkV2BalanceObject;
}

/**
 * Tink V2 Balance
 */
interface TinkV2BalanceObject<NullOrUndefined = undefined> {
  amount?: TinkV2CurrencyDenominatedAmountObject;
}

/**
 * Tink V2 Currency Denominated Amount
 */
export interface TinkV2CurrencyDenominatedAmountObject<NullOrUndefined = undefined> {
  currencyCode?: string;
  value?: TinkV2ExactNumber;
}

/**
 * Tink V2 Exact Number
 */
interface TinkV2ExactNumber<NullOrUndefined = undefined> {
  scale?: string;
  unscaledValue?: string;
}

/**
 * Tink V2 Account Dates
 */
interface TinkV2AccountDatesObject<NullOrUndefined = undefined> {
  lastRefreshed: string;
}

/**
 * Tink V2 Account Identifiers
 */
interface TinkV2AccountIdentifiersObject<NullOrUndefined = undefined> {
  financialInstitution?: TinkV2FinancialInstitutionObject;
  iban?: TinkV2IbanObject;
  pan?: TinkV2PanObject;
  sortCode?: TinkV2SortCodeObject;
}

/**
 * Tink V2 Financial Institution
 */
interface TinkV2FinancialInstitutionObject<NullOrUndefined = undefined> {
  accountNumber: string;
  referenceNumbers?: Record<string, unknown>;
}

/**
 * Tink V2 Iban
 */
interface TinkV2IbanObject<NullOrUndefined = undefined> {
  bban: string;
  bic?: string;
  iban: string;
}

/**
 * Tink V2 Pan
 */
interface TinkV2PanObject<NullOrUndefined = undefined> {
  masked: string;
}

/**
 * Tink V2 Sort Code
 */
interface TinkV2SortCodeObject<NullOrUndefined = undefined> {
  accountNumber: string;
  code: string;
}
