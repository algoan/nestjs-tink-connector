/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Tink Account Type
 */
 export enum TinkAccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT',
  MORTGAGE = 'MORTGAGE',
  CREDIT_CARD = 'CREDIT_CARD',
  LOAN = 'LOAN',
  PENSION = 'PENSION',
  OTHER = 'OTHER',
  EXTERN = 'EXTERN',
}

/**
 * Tink Account flag
 */
 export enum TinkAccountFlag {
  BUSINESS = 'BUSINESS',
  MANDATE = 'MANDATE',
}
