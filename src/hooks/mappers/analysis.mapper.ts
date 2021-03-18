/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { AccountType, AccountUsage } from "../../algoan/dto/analysis.enum";
import { Account, AccountTransaction, AnalysisUpdateInput } from "../../algoan/dto/analysis.inputs";
import { TinkAccountFlag, TinkAccountType } from "../../tink/dto/account.enums";
import { TinkAccountObject } from "../../tink/dto/account.objects";
import { TinkProviderObject } from "../../tink/dto/provider.objects";
import { TinkTransactionResponseObject } from "../../tink/dto/search.objects";

/**
 * Default currency if no provided
 */
export const defaultCurrency: string = 'EUR';

/**
 * Map Tink Data To Algoan Analysis
 */
export function mapTinkDataToAlgoanAnalysis(
  accounts: TinkAccountObject[],
  transactions: TinkTransactionResponseObject[],
  providers: TinkProviderObject[],
): AnalysisUpdateInput {
  // Map providers by financialInstitutionId
  const providerById: Map<string, TinkProviderObject> = providers
    .reduce(
      (map: Map<string, TinkProviderObject>, p: TinkProviderObject) => {
        map.set(p.financialInstitutionId, p);

        return map;
      },
      new Map(),
    );

  // Group transactions by accountId
  const transactionsByAccountId: Map<string, TinkTransactionResponseObject[]> = transactions
    .reduce(
      (map: Map<string, TinkTransactionResponseObject[]>, t: TinkTransactionResponseObject) => {
        map.set(t.accountId, [...(map.get(t.accountId) ?? []), t]);

        return map;
      },
      new Map(),
    );


  return {
    accounts: accounts
      .map(
        (tinkAccount: TinkAccountObject) => mapToAlgoanAccount(
          tinkAccount,
          transactionsByAccountId.get(tinkAccount.id) ?? [],
          tinkAccount.financialInstitutionId !== undefined
            ? providerById.get(tinkAccount.financialInstitutionId)
            : undefined,
        )
      ),
  };
};

/**
 * Map To Algoan Account
 */
export function mapToAlgoanAccount(
  tinkAccount: TinkAccountObject,
  tinkTransactions: TinkTransactionResponseObject[],
  tinkProvider?: TinkProviderObject,
): Account {
  return {
    balance: tinkAccount.balance,
    balanceDate: new Date().toISOString(),
    currency: tinkAccount.currencyDenominatedBalance?.currencyCode ?? defaultCurrency,
    type: mapToAlgoanAccountType(tinkAccount.type),
    usage: mapToAlgoanAccountUsage(tinkAccount.flags),
    owners: tinkAccount.holderName !== undefined
      ? [
          { name: tinkAccount.holderName},
        ]
      : undefined,
    name: tinkAccount.name,
    bank: {
      id: tinkAccount.financialInstitutionId,
      logoUrl: tinkProvider?.images?.icon,
      name: tinkProvider?.displayName,
      country: tinkProvider?.market,
    },
    country: tinkProvider?.market,
    aggregator: {
      id: tinkAccount.id,
    },
    transactions: tinkTransactions.map(mapToAlgaonTransaction),
    ...mapToIbanAndBic(tinkAccount.identifiers),
  }
}

/**
 * Map To Algoan account type
 */
export function mapToAlgoanAccountType(tinkType: TinkAccountObject['type']): Account['type'] {
  switch (tinkType) {
    case TinkAccountType.CHECKING:
      return AccountType.CHECKING
    case TinkAccountType.SAVINGS:
      return AccountType.SAVINGS
    case TinkAccountType.LOAN:
      return AccountType.LOAN
    case TinkAccountType.CREDIT_CARD:
      return AccountType.CREDIT_CARD
    default:
      return AccountType.UNKNOWN;
  }
 }

/**
 * Map To Algoan Account usage
 */
export function mapToAlgoanAccountUsage(tinkFlags: TinkAccountObject['flags']): Account['usage'] {
  if (tinkFlags === undefined) {
    return AccountUsage.UNKNOWN;
  }

  if (tinkFlags.search(TinkAccountFlag.BUSINESS) > 0) {
    return AccountUsage.PROFESSIONAL;
  }

  if (tinkFlags.search(TinkAccountFlag.MANDATE) > 0) {
    return AccountUsage.PERSONAL;
  }

  return AccountUsage.UNKNOWN;
 }

/**
 * Map To Algoan iban and bic fields
 *
 * We could also use the `iban` field of the Tink Account,
 * But we could only have this field, and not the bic
 *
 * Example of value:
 * - '[\"iban://BOUSFRPPXXX/FR7640618802800004063675660\"]'
 * - '[\"iban://BE57908509049130\"]'
 */
export function mapToIbanAndBic(identifiers: TinkAccountObject['identifiers']): Pick<Account, 'iban' | 'bic'> {
  const regex: RegExp = /^\[\"iban\:\/\/(?:(?:([A-Z0-9]+)|(?:([A-Z]+)\/([A-Z0-9]+))))\"\]/g;

  const matchs: (string | undefined)[] | undefined = regex.exec(identifiers) ?? undefined;

  if (matchs !== undefined) {
    if (matchs[1] !== undefined) {
      return {
        iban: matchs[1],
      };
    }

    return {
      // eslint-disable-next-line no-magic-numbers
      bic: matchs[2],
      // eslint-disable-next-line no-magic-numbers
      iban: matchs[3],
    };
  }

  return {};
}

/**
 * Map To Algoan transaction
 */
export function mapToAlgaonTransaction(tinkTransaction: TinkTransactionResponseObject): AccountTransaction {
  return {
    dates: {
      debitedAt: new Date(tinkTransaction.originalDate).toISOString(),
    },
    description: tinkTransaction.originalDescription,
    amount: tinkTransaction.amount,
    currency: tinkTransaction.currencyDenominatedOriginalAmount?.currencyCode ?? defaultCurrency,
    isComing: tinkTransaction.upcoming,
    aggregator: {
      id: tinkTransaction.id,
      category: tinkTransaction.categoryType,
      type: tinkTransaction.type,
    }
  }
}
