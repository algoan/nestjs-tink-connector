/* eslint-disable @typescript-eslint/naming-convention,camelcase,no-magic-numbers */
import { HttpModule } from '@nestjs/axios';
import { ContextIdFactory } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'node-config-ts';

import { CONFIG } from '../../config/config.module';

import { TinkSearchResponseObject, TinkSearchResultObject, TinkTransactionResponseObject } from '../dto/search.objects';
import { tinkSearchResponseObjectMock } from '../dto/search.objects.mock';
import { TinkSearchQueryInput } from '../dto/search.input';
import { tinkCategoryListMock } from '../dto/category.object.mock';
import { TinkV2TransactionObject } from '../dto/transaction-v2.object';
import { tinkV2TransactionObjectMock } from '../dto/transaction-v2.object.mock';
import { tinkV2AccountObjectMock } from '../dto/account-v2.object.mock';
import { TinkTransactionService } from './tink-transaction.service';
import { TinkHttpService } from './tink-http.service';
import { TinkCategoryService } from './tink-category.service';

describe('TinkSearchService', () => {
  let tinkTransactionService: TinkTransactionService;
  let tinkHttpService: TinkHttpService;

  beforeEach(async () => {
    // To mock scoped DI
    const contextId = ContextIdFactory.create();
    jest.spyOn(ContextIdFactory, 'getByRequest').mockImplementation(() => contextId);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        TinkHttpService,
        TinkTransactionService,
        TinkCategoryService,
        {
          provide: CONFIG,
          useValue: config,
        },
      ],
    }).compile();

    tinkTransactionService = await moduleRef.resolve<TinkTransactionService>(TinkTransactionService, contextId);
    tinkHttpService = await moduleRef.resolve<TinkHttpService>(TinkHttpService, contextId);
    const tinkCategoryService: TinkCategoryService = await moduleRef.resolve<TinkCategoryService>(
      TinkCategoryService,
      contextId,
    );

    tinkCategoryService.categories = tinkCategoryListMock;
  });

  it('should be defined', () => {
    expect(tinkTransactionService).toBeDefined();
  });

  describe('getTransactions', () => {
    it('should return a transactions list', async () => {
      const itemPerPage: number = 1000;
      const spy = jest.spyOn(tinkHttpService, 'post').mockReturnValue(Promise.resolve(tinkSearchResponseObjectMock));

      const input: TinkSearchQueryInput = {
        accounts: ['12345678910'],
        offset: 0,
        limit: itemPerPage,
      };

      const transactions: TinkTransactionResponseObject[] = await tinkTransactionService.getTransactions(input);

      expect(spy).toHaveBeenCalledWith(`/api/v1/search`, input);
      expect(transactions).toEqual(
        tinkSearchResponseObjectMock.results.map((r: TinkSearchResultObject) => ({
          categoryCode: 'expenses:house.other',
          ...r.transaction,
        })),
      );
    });

    it('should return a transactions list of all pages', async () => {
      const totalTransactionsCount: number = 2050;
      const itemPerPage: number = 1000;
      const allTransactionResultsMock: TinkSearchResultObject[] = Array(totalTransactionsCount).fill(
        tinkSearchResponseObjectMock.results[0],
      );

      const spy = jest
        .spyOn(tinkHttpService, 'post')
        .mockImplementation(async (_: string, input: TinkSearchQueryInput) => {
          const transactionResultsPaginated: TinkSearchResultObject[] = allTransactionResultsMock.slice(
            input.offset,
            (input.offset ?? 0) + (input.limit ?? 0),
          );
          const searchResult: TinkSearchResponseObject = {
            count: transactionResultsPaginated.length,
            results: transactionResultsPaginated,
          };

          return Promise.resolve(searchResult);
        });

      const transactions: TinkTransactionResponseObject[] = await tinkTransactionService.getTransactions();

      expect(spy).toHaveBeenCalledTimes(Math.ceil(totalTransactionsCount / itemPerPage));
      expect(transactions.length).toEqual(totalTransactionsCount);
    });
  });

  describe('getTransactionsV2', () => {
    it('should return a transactions list', async () => {
      const expectedTransactions: TinkV2TransactionObject[] = [tinkV2TransactionObjectMock];

      const spy = jest.spyOn(tinkHttpService, 'get').mockReturnValueOnce(
        Promise.resolve({
          transactions: expectedTransactions,
          nextPageToken: '',
        }),
      );

      const transactions: TinkV2TransactionObject[] = await tinkTransactionService.getTransactionsV2(
        tinkV2AccountObjectMock.id,
      );

      expect(spy.mock.calls.length).toEqual(1);
      expect(spy.mock.calls[0][0]).toEqual(`/data/v2/transactions`);
      expect(spy.mock.calls[0][1]).toEqual({ accountIdIn: tinkV2AccountObjectMock.id, pageSize: 1000 });
      expect(transactions).toEqual(expectedTransactions);
    });

    it('should return a transactions list of all pages', async () => {
      const totalTransactionsCount: number = 2500;
      const expectedTransactions: TinkSearchResultObject[] =
        Array(totalTransactionsCount).fill(tinkV2TransactionObjectMock);

      const spy = jest
        .spyOn(tinkHttpService, 'get')
        .mockReturnValueOnce(
          Promise.resolve({
            transactions: expectedTransactions.slice(0, 1000),
            nextPageToken: 'second-page-token',
          }),
        )
        .mockReturnValueOnce(
          Promise.resolve({
            transactions: expectedTransactions.slice(1000, 2000),
            nextPageToken: 'third-page-token',
          }),
        )
        .mockReturnValueOnce(
          Promise.resolve({
            transactions: expectedTransactions.slice(2000),
            nextPageToken: '',
          }),
        );

      const transactions: TinkV2TransactionObject[] = await tinkTransactionService.getTransactionsV2(
        tinkV2AccountObjectMock.id,
      );

      expect(spy.mock.calls.length).toEqual(3);
      expect(spy.mock.calls[0][0]).toEqual(`/data/v2/transactions`);
      expect(spy.mock.calls[0][1]).toEqual({ accountIdIn: tinkV2AccountObjectMock.id, pageSize: 1000 });
      expect(spy.mock.calls[1][0]).toEqual(`/data/v2/transactions`);
      expect(spy.mock.calls[1][1]).toEqual({
        accountIdIn: tinkV2AccountObjectMock.id,
        pageSize: 1000,
        pageToken: 'second-page-token',
      });
      expect(spy.mock.calls[2][0]).toEqual(`/data/v2/transactions`);
      expect(spy.mock.calls[2][1]).toEqual({
        accountIdIn: tinkV2AccountObjectMock.id,
        pageSize: 1000,
        pageToken: 'third-page-token',
      });
      expect(transactions).toEqual(expectedTransactions);
    });
  });
});
