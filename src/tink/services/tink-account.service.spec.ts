/* eslint-disable @typescript-eslint/naming-convention,camelcase,no-magic-numbers */
import { HttpModule } from '@nestjs/common';
import { ContextIdFactory } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'node-config-ts';

import { CONFIG } from '../../config/config.module';
import { TinkAccountObject } from '../dto/account.objects';
import { tinkAccountListResponseObjectMock } from '../dto/account.objects.mock';

import {
  TinkV2AccountObject,
  TinkV2GetAccountsQueryParameters,
  TinkV2GetAccountsResponseObject,
} from '../dto/account-v2.object';
import { tinkV2AccountObjectMock } from '../dto/account-v2.object.mock';
import { TinkAccountService } from './tink-account.service';
import { TinkHttpService } from './tink-http.service';

describe('TinkAccountService', () => {
  let tinkAccountService: TinkAccountService;
  let tinkHttpService: TinkHttpService;

  beforeEach(async () => {
    // To mock scoped DI
    const contextId = ContextIdFactory.create();
    jest.spyOn(ContextIdFactory, 'getByRequest').mockImplementation(() => contextId);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        TinkHttpService,
        TinkAccountService,
        {
          provide: CONFIG,
          useValue: config,
        },
      ],
    }).compile();

    tinkAccountService = await moduleRef.resolve<TinkAccountService>(TinkAccountService, contextId);
    tinkHttpService = await moduleRef.resolve<TinkHttpService>(TinkHttpService, contextId);
  });

  it('should be defined', () => {
    expect(tinkAccountService).toBeDefined();
  });

  describe('getAccounts', () => {
    it('should return an account list', async () => {
      const spy = jest
        .spyOn(tinkHttpService, 'get')
        .mockReturnValue(Promise.resolve(tinkAccountListResponseObjectMock));

      const accounts: TinkAccountObject[] = await tinkAccountService.getAccounts();

      expect(spy).toHaveBeenCalledWith(`/api/v1/accounts/list`);
      expect(accounts).toStrictEqual(tinkAccountListResponseObjectMock.accounts);
    });
  });

  describe('getAccountsV2', () => {
    it('should return the account list ', async () => {
      const spy = jest.spyOn(tinkHttpService, 'get').mockReturnValueOnce(
        Promise.resolve({
          accounts: [tinkV2AccountObjectMock],
          nextPageToken: '',
        }),
      );

      const accounts: TinkV2AccountObject[] = await tinkAccountService.getAccountsV2();

      expect(spy.mock.calls.length).toEqual(1);
      expect(spy.mock.calls[0][0]).toEqual(`/data/v2/accounts`);
      expect(spy.mock.calls[0][1]).toEqual({ pageSize: 100 });
      expect(accounts).toStrictEqual([tinkV2AccountObjectMock]);
    });

    it('should return the account list from all pages', async () => {
      const totalAccountsCount: number = 250;
      const expectedAccounts: TinkV2AccountObject[] = Array(totalAccountsCount).fill(tinkV2AccountObjectMock);

      const spy = jest
        .spyOn(tinkHttpService, 'get')
        .mockReturnValueOnce(
          Promise.resolve({
            nextPageToken: 'second-page-token',
            accounts: expectedAccounts.slice(0, 100),
          }),
        )
        .mockReturnValueOnce(
          Promise.resolve({
            nextPageToken: 'third-page-token',
            accounts: expectedAccounts.slice(100, 200),
          }),
        )
        .mockReturnValueOnce(
          Promise.resolve({
            nextPageToken: '',
            accounts: expectedAccounts.slice(200),
          }),
        );

      const accounts: TinkV2AccountObject[] = await tinkAccountService.getAccountsV2();

      expect(spy.mock.calls.length).toEqual(3);
      expect(spy.mock.calls[0][0]).toEqual(`/data/v2/accounts`);
      expect(spy.mock.calls[0][1]).toEqual({ pageSize: 100 });
      expect(spy.mock.calls[1][0]).toEqual(`/data/v2/accounts`);
      expect(spy.mock.calls[1][1]).toEqual({ pageToken: 'second-page-token', pageSize: 100 });
      expect(spy.mock.calls[2][0]).toEqual(`/data/v2/accounts`);
      expect(spy.mock.calls[2][1]).toEqual({ pageToken: 'third-page-token', pageSize: 100 });

      expect(accounts).toStrictEqual(expectedAccounts);
    });
  });
});
