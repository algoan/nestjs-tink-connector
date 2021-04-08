/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Tink Transaction Category Type
 */
export enum TinkTransactionCategoryType {
  INCOME = 'INCOME',
  EXPENSES = 'EXPENSES',
  TRANSFERS = 'TRANSFERS',
}

/**
 * Tink Transaction  Type
 */
export enum TinkTransactionType {
  DEFAULT = 'DEFAULT',
  CREDIT_CARD = 'CREDIT_CARD',
  TRANSFER = 'TRANSFER',
  PAYMENT = 'PAYMENT',
  WITHDRAWAL = 'WITHDRAWAL',
}
