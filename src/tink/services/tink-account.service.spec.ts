/* eslint-disable @typescript-eslint/naming-convention,camelcase */
import { HttpModule } from '@nestjs/common';
import { ContextIdFactory } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'node-config-ts';

import { CONFIG } from '../../config/config.module';
import { TinkAccountObject } from '../dto/account.objects';
import { tinkAccountListResponseObjectMock } from '../dto/account.objects.mock';

import { TinkAccountService } from './tink-account.service';
import { TinkHttpService } from './tink-http.service';

describe('TinkAccountService', () => {
  let tinkAccountService: TinkAccountService;
  let tinkHttpService: TinkHttpService;

  beforeEach(async () => {
    // To mock scoped DI
    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
      ],
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
});
