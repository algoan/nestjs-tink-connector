/* eslint-disable @typescript-eslint/naming-convention,camelcase */
import { HttpModule } from '@nestjs/common';
import { ContextIdFactory } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'node-config-ts';

import { CONFIG } from '../../config/config.module';

import { tinkProviderListResponseObjectMock } from '../dto/provider.objects.mock';
import { TinkProviderObject } from '../dto/provider.objects';
import { TinkProviderListArgs } from '../dto/provider.args';
import { TinkProviderService } from './tink-provider.service';
import { TinkHttpService } from './tink-http.service';

describe('TinkProviderService', () => {
  let tinkProviderService: TinkProviderService;
  let tinkHttpService: TinkHttpService;

  describe('Service', () => {
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
          TinkProviderService,
          {
            provide: CONFIG,
            useValue: config,
          },
        ],
      }).compile();

      tinkProviderService = await moduleRef.resolve<TinkProviderService>(TinkProviderService, contextId);
      tinkHttpService = await moduleRef.resolve<TinkHttpService>(TinkHttpService, contextId);
    });

    it('should be defined', () => {
      expect(tinkProviderService).toBeDefined();
    });
  });

  describe('Service WITH test activated', () => {
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
          TinkProviderService,
          {
            provide: CONFIG,
            useValue: {
              ...config,
              tink: {
                ...config.tink,
                test: true,
              }
            },
          },
        ],
      }).compile();

      tinkProviderService = await moduleRef.resolve<TinkProviderService>(TinkProviderService, contextId);
      tinkHttpService = await moduleRef.resolve<TinkHttpService>(TinkHttpService, contextId);
    });

    it('should return a providers list WITH test providers', async () => {
      const spy = jest
        .spyOn(tinkHttpService, 'get')
        .mockReturnValue(Promise.resolve(tinkProviderListResponseObjectMock));

      const args: TinkProviderListArgs = {
        includeTestProviders: true,
        excludeNonTestProviders: true,
      };

      const accounts: TinkProviderObject[] = await tinkProviderService.getProviders();

      expect(spy).toHaveBeenCalledWith(`/api/v1/providers`, args);
      expect(accounts).toStrictEqual(tinkProviderListResponseObjectMock.providers);
    });
  });

  describe('service WITHOUT test activated', () => {
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
          TinkProviderService,
          {
            provide: CONFIG,
            useValue: {
              ...config,
              tink: {
                ...config.tink,
                test: false,
              }
            },
          },
        ],
      }).compile();

      tinkProviderService = await moduleRef.resolve<TinkProviderService>(TinkProviderService, contextId);
      tinkHttpService = await moduleRef.resolve<TinkHttpService>(TinkHttpService, contextId);
    });

    it('should return a providers list WITHOUT test providers', async () => {
      const spy = jest
        .spyOn(tinkHttpService, 'get')
        .mockReturnValue(Promise.resolve(tinkProviderListResponseObjectMock));

      const args: TinkProviderListArgs = {
        includeTestProviders: false,
        excludeNonTestProviders: false,
      };

      const accounts: TinkProviderObject[] = await tinkProviderService.getProviders();

      expect(spy).toHaveBeenCalledWith(`/api/v1/providers`, args);
      expect(accounts).toStrictEqual(tinkProviderListResponseObjectMock.providers);
    });
  });
});
