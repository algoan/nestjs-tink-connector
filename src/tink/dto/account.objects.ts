import { TinkAccountType } from './account.enums';

/**
 * Tink Account List Response
 *
 * @link https://docs.tink.com/api#account-list-accounts-response-accountlistresponse
 */
 export interface TinkAccountListResponseObject<NullOrUndefined = undefined> {
  accounts: TinkAccountObject<NullOrUndefined>[],
}

/**
 * Tink account
 *
 * Only fields used
 *
 * @link https://docs.tink.com/api#account-the-account-model
 */
export interface TinkAccountObject<NullOrUndefined = undefined> {
  balance: number;
  credentialsId: string;
  currencyDenominatedBalance: TinkAccountCurrencyDenominatedBalanceObject | NullOrUndefined;
  financialInstitutionId: string | NullOrUndefined; // To linnk with TinkProvider.financialInstitutionId
  flags: string | NullOrUndefined; // Array String. Example: '[\"MANDATE\"]';
  holderName: string | NullOrUndefined;
  identifiers: string; // Array String. Example: "[\"se://9999111111111111\"]"
  id: string;
  name: string;
  type: TinkAccountType;
  iban?: string, // Don't know yet if it is returned each time, not in the documentation.
}

/**
 * Tink Account Currency Denominated Balance
 *
 * Only fields used
 *
 * @link https://docs.tink.com/api#account-the-account-model-currencydenominatedamount
 */
export interface TinkAccountCurrencyDenominatedBalanceObject {
  currencyCode: string; // ISO 4217
}
