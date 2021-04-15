/* eslint-disable @typescript-eslint/naming-convention,camelcase */
import { HttpModule, HttpService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { config } from 'node-config-ts';
import { of } from 'rxjs';
import { ContextIdFactory } from '@nestjs/core';

import { CONFIG } from '../../config/config.module';
import { tinkCategoryListMock } from '../dto/category.object.mock';
import { TinkCategory } from '../dto/category.object';
import { TinkCategoryService } from './tink-category.service';

describe('TinkCategoryService', () => {
  let tinkCategoryService: TinkCategoryService;
  let httpService: HttpService;

  beforeEach(async () => {
    // To mock scoped DI
    const contextId = ContextIdFactory.create();
    jest.spyOn(ContextIdFactory, 'getByRequest').mockImplementation(() => contextId);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        TinkCategoryService,
        {
          provide: CONFIG,
          useValue: config,
        },
      ],
    }).compile();

    tinkCategoryService = await moduleRef.resolve<TinkCategoryService>(TinkCategoryService, contextId);
    httpService = await moduleRef.resolve<HttpService>(HttpService, contextId);
    jest.spyOn(httpService, 'get').mockReturnValue(of({ data: tinkCategoryListMock } as AxiosResponse<TinkCategory[]>));

    await tinkCategoryService.onModuleInit();
  });

  it('should be defined', () => {
    expect(tinkCategoryService).toBeDefined();
  });

  it('should fill the category list', async () => {
    const expectedLength: number = 2;

    expect(tinkCategoryService.categories).toHaveLength(expectedLength);
  });

  describe('getCategoryById', () => {
    it('should properly return the correct code', async () => {
      expect(tinkCategoryService.getCategoryCodeById('01f944531ab04cd3ba32a14cebe8a927')).toEqual(
        'expenses:house.other',
      );
      expect(tinkCategoryService.getCategoryCodeById('0217989903af43c5b7b4e66c0515d0d5')).toEqual(
        'expenses:misc.outlays',
      );
    });

    it('should return undefined', async () => {
      expect(tinkCategoryService.getCategoryCodeById('random')).toBeUndefined();
    });
  });
});
