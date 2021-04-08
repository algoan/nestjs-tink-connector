import { AccountType, AccountUsage, AccountSavingType, AccountLoanType } from './analysis.enum';

/**
 * Analysis Update Input
 */
export interface AnalysisUpdateInput {
  accounts: Account[];
}

/**
 * Account
 */
export interface Account {
  balance: number;
  balanceDate: string; // IsoDateString
  currency: string; // ISO4217
  type: AccountType;
  usage: AccountUsage;
  owners?: AccountOwner[];
  iban?: string;
  bic?: string;
  name?: string;
  bank?: AccountBank;
  country?: string; // format ISO 3166-1 alpha-2
  coming?: number;
  details?: AccountDetails;
  aggregator?: AccountAggregator;
  transactions?: AccountTransaction[];
}

/**
 * Account Owner
 */
export interface AccountOwner {
  name?: string;
}

/**
 * Accoun tBank
 */
export interface AccountBank {
  id?: string;
  logoUrl?: string;
  name?: string;
  country?: string;
}

/**
 * Account Details
 */
export interface AccountDetails {
  savings?: AccountDetailsSavings;
  loans?: AccountDetailsLoans;
}

/**
 * Account Details Savings
 */
export interface AccountDetailsSavings {
  type?: AccountSavingType;
  openedAt?: string; // IsoDateString
  maximumAmount?: number;
  interestRate?: number;
}
/**
 * Account Details Loans
 */
export interface AccountDetailsLoans {
  type?: AccountLoanType;
  amount?: number;
  startDate?: string; // IsoDateString
  endDate?: string; // IsoDateString
  duration?: number; // in month
  insuranceLabel?: string;
  payment?: number; // By Month
  remainingCapital?: number;
  interestRate?: number;
}

/**
 * Account Aggregator
 */
export interface AccountAggregator {
  id: string;
}

/**
 * Account Transactions
 */
export interface AccountTransaction {
  dates: AccountTransactionDates;
  description: string;
  amount: number;
  currency: string; // format ISO 3166-1 alpha-2 // Default EUR
  isComing?: boolean;
  aggregator?: AccountTransactionAggregator;
}

/**
 * Account Transaction Dates
 */
export interface AccountTransactionDates {
  debitedAt?: string; // IsoDateString
  bookedAt?: string; // IsoDateString
}

/**
 * Account Transaction Aggregator
 */
export interface AccountTransactionAggregator {
  id?: string;
  category?: string;
  type?: string;
}
