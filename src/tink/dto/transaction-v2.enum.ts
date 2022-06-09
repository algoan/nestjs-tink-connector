/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Tink V2 Mutability
 */
export enum TinkV2Mutability {
  MUTABILITY_UNDEFINED = 'MUTABILITY_UNDEFINED',
  MUTABLE = 'MUTABLE',
  IMMUTABLE = 'IMMUTABLE',
}

/**
 * Tink V2 Transaction Status
 */
export enum TinkV2TransactionStatus {
  UNDEFINED = 'UNDEFINE',
  PENDING = 'PENDING',
  BOOKED = 'BOOKED',
}

/**
 * Tink V2 Transaction Type
 */
export enum TinkV2TransactionType {
  UNDEFINED = 'UNDEFINED',
  CREDIT_CARD = 'CREDIT_CARD',
  PAYMENT = 'PAYMENT',
  WITHDRAWAL = 'WITHDRAWAL',
  DEFAULT = 'DEFAULT',
  TRANSFER = 'TRANSFER',
}
