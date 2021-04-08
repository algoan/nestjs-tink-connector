/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Analysis Status enum
 */
export enum AnalysisStatus {
  CREATED = 'CREATED',
  ERROR = 'ERROR',
  INPROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

/**
 * Account Type enum
 */
export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  LOAN = 'LOAN',
  CREDIT_CARD = 'CREDIT_CARD',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Account Usage enum
 */
export enum AccountUsage {
  PROFESSIONAL = 'PROFESSIONAL',
  PERSONAL = 'PERSONAL',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Account Sing Type enum
 */
export enum AccountSavingType {
  SHORT_TERM = 'SHORT_TERM',
  LONG_TERM = 'LONG_TERM',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Account Loan Type enum
 */
export enum AccountLoanType {
  REVOLVING = 'REVOLVING',
  PERSONAL = 'PERSONAL',
  MORTGAGE = 'MORTGAGE',
  OTHER = 'OTHER',
}
