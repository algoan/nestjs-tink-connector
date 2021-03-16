/* eslint-disable @typescript-eslint/naming-convention,camelcase */
import { HttpModule, HttpService } from '@nestjs/common';
import { ContextIdFactory } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'node-config-ts';

import { CONFIG } from '../../config/config.module';

import { TinkAccountService } from './tink-account.service';
import { TinkHttpService } from './tink-http.service';

describe('TinkAccountService', () => {
  let tinkAccountService: TinkAccountService;
  let httpService: HttpService;

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
    httpService = await moduleRef.resolve<HttpService>(HttpService, contextId);
  });

  it('should be defined', () => {
    expect(tinkAccountService).toBeDefined();
  });
});
