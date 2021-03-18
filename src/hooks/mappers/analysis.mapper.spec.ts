/* eslint-disable @typescript-eslint/naming-convention,camelcase */

import { TinkAccountObject } from "../../tink/dto/account.objects";
import { tinkAccountObjectMock } from "../../tink/dto/account.objects.mock";
import { tinkProviderObjectMock } from "../../tink/dto/provider.objects.mock";
import { TinkAccountType } from "../../tink/dto/account.enums";
import { AccountType, AccountUsage } from "../../algoan/dto/analysis.enum";
import { Account, AccountTransaction, AnalysisUpdateInput } from "../../algoan/dto/analysis.inputs";
import { TinkTransactionResponseObject } from "../../tink/dto/search.objects";
import { tinkSearchResponseObjectMock } from "../../tink/dto/search.objects.mock";
import { TinkProviderObject } from "../../tink/dto/provider.objects";
import {
  defaultCurrency,
  mapTinkDataToAlgoanAnalysis,
  mapToAlgaonTransaction,
  mapToAlgoanAccount,
  mapToAlgoanAccountType,
  mapToAlgoanAccountUsage,
  mapToIbanAndBic
} from "./analysis.mapper";

describe('AnalysisMapper', () => {
  describe('mapToAlgaonTransaction', () => {
    it('should return an algoan transaction', async () => {
      // Transaction mock
      const tinkTransaction: TinkTransactionResponseObject = tinkSearchResponseObjectMock.results[0].transaction;

      // We map it
      const accountTransaction: AccountTransaction = mapToAlgaonTransaction(tinkTransaction);

      // We get an algoan transaction
      expect(accountTransaction).toEqual({
        dates: {
          debitedAt: '2016-02-17T20:27:54.875Z',
        },
        description: tinkTransaction.originalDescription,
        amount: tinkTransaction.amount,
        currency: tinkTransaction.currencyDenominatedOriginalAmount?.currencyCode,
        isComing: tinkTransaction.upcoming,
        aggregator: {
          id: tinkTransaction.id,
          category: tinkTransaction.categoryType,
          type: tinkTransaction.type,
        }
      })
    });

    it('should return an algoan transaction with a default currency', async () => {
      // Tink transaction without currency information
      const tinkTransaction: TinkTransactionResponseObject = {
        ...tinkSearchResponseObjectMock.results[0].transaction,
        currencyDenominatedOriginalAmount: undefined,
      };

      // transaction currency is undefined
      expect(tinkTransaction.currencyDenominatedOriginalAmount?.currencyCode).toBeUndefined()

      // We map it
      const accountTransaction: AccountTransaction = mapToAlgaonTransaction(tinkTransaction);

      // New transaction has the default currency
      expect(accountTransaction.currency).toEqual(defaultCurrency);
    });
  });

  describe('mapToIbanAndBic', () => {
    it('should return iban and bic fields', async () => {
      // Transaction mock
      const identifiers: string = '["iban://BOUSFRPPXXX/FR7640618802800004063675660"]';

      // We map it
      const ibanAndBic: Pick<Account, 'iban' | 'bic'> = mapToIbanAndBic(identifiers);

      // We should get the right iban
      expect(ibanAndBic.iban).toEqual('FR7640618802800004063675660');

      // We should get the right bic
      expect(ibanAndBic.bic).toEqual('BOUSFRPPXXX');
    });

    it('should return only iban field', async () => {
      // Transaction mock
      const identifiers: string = '["iban://FR7640618802800004063675660"]';

      // We map it
      const ibanAndBic: Pick<Account, 'iban' | 'bic'> = mapToIbanAndBic(identifiers);

      // We should get the right iban
      expect(ibanAndBic.iban).toEqual('FR7640618802800004063675660');

      // We should not have a bic
      expect(ibanAndBic.bic).toBeUndefined();
    });

    it('should NOT return iban and bic field if prefix is incorrect', async () => {
      // Transaction mock
      const identifiers: string = '["ibaan://BOUSFRPPXXX/FR7640618802800004063675660"]';

      // We map it
      const ibanAndBic: Pick<Account, 'iban' | 'bic'> = mapToIbanAndBic(identifiers);

      // We should not have a bic
      expect(ibanAndBic.bic).toBeUndefined()

      // We should not have an iban
      expect(ibanAndBic.iban).toBeUndefined()
    });

    it('should NOT return iban and bic field if not right values', async () => {
      // Transaction mock
      const identifiers: string = '["ibaan://BOUSF00R-PPXXX/FR7640618802800004-630675660"]';

      // We map it
      const ibanAndBic: Pick<Account, 'iban' | 'bic'> = mapToIbanAndBic(identifiers);

      // We should not have a bic
      expect(ibanAndBic.bic).toBeUndefined()

      // We should not have an iban
      expect(ibanAndBic.iban).toBeUndefined()
    });

    it('should NOT return iban and bic field if empty array', async () => {
      // Transaction mock
      const identifiers: string = '[]';

      // We map it
      const ibanAndBic: Pick<Account, 'iban' | 'bic'> = mapToIbanAndBic(identifiers);

      // We should not have a bic
      expect(ibanAndBic.bic).toBeUndefined()

      // We should not have an iban
      expect(ibanAndBic.iban).toBeUndefined()
    });

    it('should NOT return iban and bic field if empty string', async () => {
      // Transaction mock
      const identifiers: string = '';

      // We map it
      const ibanAndBic: Pick<Account, 'iban' | 'bic'> = mapToIbanAndBic(identifiers);

      // We should not have a bic
      expect(ibanAndBic.bic).toBeUndefined()

      // We should not have an iban
      expect(ibanAndBic.iban).toBeUndefined()
    });
  });

  describe('mapToAlgoanAccountUsage', () => {
    it('should return UNKNOWN if undefined', async () => {
      expect(mapToAlgoanAccountUsage(undefined)).toBe(AccountUsage.UNKNOWN)
    });

    it('should return PROFESSIONAL if flag containes BUSINESS', async () => {
      expect(mapToAlgoanAccountUsage('["BUSINESS"]')).toBe(AccountUsage.PROFESSIONAL)
    });

    it('should return PERSONAL if flag containes MANDATE', async () => {
      expect(mapToAlgoanAccountUsage('["MANDATE"]')).toBe(AccountUsage.PERSONAL)
    });

    it('should return UNKNOWN if flag contains unknown values', async () => {
      expect(mapToAlgoanAccountUsage('["XXXX"]')).toBe(AccountUsage.UNKNOWN)
    });
  });

  describe('mapToAlgoanAccountType', () => {
    it(`should return ${AccountType.CHECKING} if ${TinkAccountType.CHECKING}`, async () => {
      expect(mapToAlgoanAccountType(TinkAccountType.CHECKING)).toBe(AccountType.CHECKING)
    });

    it(`should return ${AccountType.SAVINGS} if ${TinkAccountType.SAVINGS}`, async () => {
      expect(mapToAlgoanAccountType(TinkAccountType.SAVINGS)).toBe(AccountType.SAVINGS)
    });

    it(`should return ${AccountType.LOAN} if ${TinkAccountType.LOAN}`, async () => {
      expect(mapToAlgoanAccountType(TinkAccountType.LOAN)).toBe(AccountType.LOAN)
    });

    it(`should return ${AccountType.CREDIT_CARD} if ${TinkAccountType.CREDIT_CARD}`, async () => {
      expect(mapToAlgoanAccountType(TinkAccountType.CREDIT_CARD)).toBe(AccountType.CREDIT_CARD)
    });

    it(`should return ${AccountType.UNKNOWN} if a not available type`, async () => {
      expect(mapToAlgoanAccountType(TinkAccountType.EXTERN)).toBe(AccountType.UNKNOWN)
    });
  });

  describe('mapToAlgoanAccount', () => {
    // Force same current Date
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const toISOStringFn = Date.prototype.toISOString;
    const isoString = new Date().toISOString();

    beforeEach(async () => {
      Date.prototype.toISOString = () => isoString;
    });

    it('should return an algoan account', async () => {
      // transactions mock
      const tinkTransactionsMock: TinkTransactionResponseObject[] = [tinkSearchResponseObjectMock.results[0].transaction];

      // We map it
      const account: Account = mapToAlgoanAccount(
        tinkAccountObjectMock,
        tinkTransactionsMock,
        tinkProviderObjectMock,
      );

      // We get an algoan transaction
      expect(account).toEqual({
        balance: tinkAccountObjectMock.balance,
        balanceDate: new Date().toISOString(),
        currency: tinkAccountObjectMock.currencyDenominatedBalance?.currencyCode ?? defaultCurrency,
        type: mapToAlgoanAccountType(tinkAccountObjectMock.type),
        usage: mapToAlgoanAccountUsage(tinkAccountObjectMock.flags),
        owners: [{ name: tinkAccountObjectMock.holderName }],
        name: tinkAccountObjectMock.name,
        bank: {
          id: tinkAccountObjectMock.financialInstitutionId,
          logoUrl: tinkProviderObjectMock?.images?.icon,
          name: tinkProviderObjectMock?.displayName,
          country: tinkProviderObjectMock?.market,
        },
        country: tinkProviderObjectMock?.market,
        aggregator: {
          id: tinkAccountObjectMock.id,
        },
        transactions: tinkTransactionsMock.map(mapToAlgaonTransaction),
        ...mapToIbanAndBic(tinkAccountObjectMock.identifiers),
      });

      // Same number of transaction
      expect(account.transactions?.length).toEqual(tinkTransactionsMock.length);
      // bic an iban information
      expect(account.bic).toBeDefined();
      expect(account.iban).toBeDefined();
      // type and usage
      expect(account.type).toBeDefined();
      expect(account.usage).toBeDefined();
    });

    it('should return an algoan account without provider information', async () => {
      // transactions mock
      const tinkTransactionsMock: TinkTransactionResponseObject[] = [tinkSearchResponseObjectMock.results[0].transaction];

      // We map it
      const account: Account = mapToAlgoanAccount(
        tinkAccountObjectMock,
        tinkTransactionsMock,
      );

      // We get an algoan transaction
      expect(account).toEqual({
        balance: tinkAccountObjectMock.balance,
        balanceDate: new Date().toISOString(),
        currency: tinkAccountObjectMock.currencyDenominatedBalance?.currencyCode ?? defaultCurrency,
        type: mapToAlgoanAccountType(tinkAccountObjectMock.type),
        usage: mapToAlgoanAccountUsage(tinkAccountObjectMock.flags),
        owners: [{ name: tinkAccountObjectMock.holderName }],
        name: tinkAccountObjectMock.name,
        bank: {
          id: tinkAccountObjectMock.financialInstitutionId,
          logoUrl: undefined,
          name: undefined,
          country: undefined,
        },
        country: undefined,
        aggregator: {
          id: tinkAccountObjectMock.id,
        },
        transactions: tinkTransactionsMock.map(mapToAlgaonTransaction),
        ...mapToIbanAndBic(tinkAccountObjectMock.identifiers),
      })
    });

    it('should return an algoan account with a default currency', async () => {
      // transactions mock
      const tinkTransactionsMock: TinkTransactionResponseObject[] = [tinkSearchResponseObjectMock.results[0].transaction];

      // Account without currency information
      const tinkAccountWithoutCurrency: TinkAccountObject = {
        ...tinkAccountObjectMock,
        currencyDenominatedBalance: undefined,
      };

      // Tink account currency is undefined
      expect(tinkAccountWithoutCurrency.currencyDenominatedBalance?.currencyCode).toBeUndefined()

      // We map it
      const account: Account = mapToAlgoanAccount(
        tinkAccountObjectMock,
        tinkTransactionsMock,
      );

      // New transaction has the default currency
      expect(account.currency).toEqual(defaultCurrency);
    });

    afterEach(async () => {
      Date.prototype.toISOString = toISOStringFn;
    });
  });

  describe('mapTinkDataToAlgoanAnalysis', () => {
    // Force same current Date
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const toISOStringFn = Date.prototype.toISOString;
    const isoString = new Date().toISOString();

    beforeEach(async () => {
      Date.prototype.toISOString = () => isoString;
    });

    it('should return an algoan analysis with 2 account', async () => {
      // transactions mock
      const tinkTransactionMock: TinkTransactionResponseObject = tinkSearchResponseObjectMock.results[0].transaction;

      // mock
      const tinkTransactionsMock: TinkTransactionResponseObject[] = [
        tinkTransactionMock,
        // second transaction with an other account id
        {
          ...tinkTransactionMock,
          accountId: `account-${process.pid}`,
          originalDescription: `${tinkTransactionMock.originalDescription}-${process.pid}`,
        },
      ];
      const tinkAccountObjectsMock: TinkAccountObject[] = [
        tinkAccountObjectMock,
        // second account with an other account id and financialInstitutionId
        {
          ...tinkAccountObjectMock,
          id: `account-${process.pid}`,
          financialInstitutionId: `financial-${process.pid}`,
          holderName: `${tinkAccountObjectMock.holderName}-${process.pid}`,
        },
      ];
      const tinkProviderObjectsMock: TinkProviderObject[] = [
        tinkProviderObjectMock,
        // second provider with an other financialInstitutionId
        {
          ...tinkProviderObjectMock,
          financialInstitutionId: `financial-${process.pid}`,
          displayName: `${tinkProviderObjectMock.displayName}-${process.pid}`,

        },
      ];

     // We map it
     const analysisUpdate: AnalysisUpdateInput = mapTinkDataToAlgoanAnalysis(
      tinkAccountObjectsMock,
      tinkTransactionsMock,
      tinkProviderObjectsMock,
    );

      // We get an algoan transaction input
      expect(analysisUpdate).toEqual({
        accounts: [
          {
            aggregator: {
              id: 'a6bb87e57a8c4dd4874b241471a2b9e8',
            },
            balance: 34567.5,
            balanceDate: isoString, // Force because of currentDate ....
            bank: {
              country: 'FR',
              id: '6e68cc6287704273984567b3300c5822',
              logoUrl: 'https://cdn.tink.se/provider-images/tink.png',
              name: 'Bink',
            },
            bic: 'BOUSFRPPXXX',
            country: 'FR',
            currency: 'EUR',
            iban: 'FR7640618802800004063675660',
            name: 'My account',
            owners: [
              {
                name: 'Thomas Alan Waits',
              },
            ],
            transactions: [
              {
                aggregator: {
                  category: 'EXPENSES',
                  id: '79c6c9c27d6e42489e888e08d27205a1',
                  type: 'CREDIT_CARD',
                },
                amount: 34.5,
                currency: 'EUR',
                dates: {
                  debitedAt: isoString, // Force because of currentDate ....
                },
                description: 'Stadium Sergelg Stockholm',
                isComing: false,
              },
            ],
            type: 'CHECKING',
            usage: 'PERSONAL',
          },
          {
            aggregator: {
              id: `account-${process.pid}`,
            },
            balance: 34567.5,
            balanceDate: isoString, // Force because of currentDate ....
            bank: {
              country: 'FR',
              id: `financial-${process.pid}`,
              logoUrl: 'https://cdn.tink.se/provider-images/tink.png',
              name: `Bink-${process.pid}`,
            },
            bic: 'BOUSFRPPXXX',
            country: 'FR',
            currency: 'EUR',
            iban: 'FR7640618802800004063675660',
            name: 'My account',
            owners: [
              {
                name: `Thomas Alan Waits-${process.pid}`,
              },
            ],
            transactions: [
              {
                aggregator: {
                  category: 'EXPENSES',
                  id: '79c6c9c27d6e42489e888e08d27205a1',
                  type: 'CREDIT_CARD',
                },
                amount: 34.5,
                currency: 'EUR',
                dates: {
                  debitedAt: isoString, // Force because of currentDate ....
                },
                description: `Stadium Sergelg Stockholm-${process.pid}`,
                isComing: false,
              },
            ],
            type: 'CHECKING',
            usage: 'PERSONAL',
          },
        ],
      })
    });

    afterEach(async () => {
      Date.prototype.toISOString = toISOStringFn;
    });
  });
});
