import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'node-config-ts';

import { ContextIdFactory } from '@nestjs/core';
import { AnalysisUpdateInput } from '../dto/analysis.inputs';
import { Analysis } from '../dto/analysis.objects';
import { analysisMock } from '../dto/analysis.objects.mock';

import { CONFIG } from '../../config/config.module';
import { customerMock } from '../dto/customer.objects.mock';
import { AlgoanAnalysisService } from './algoan-analysis.service';
import { AlgoanHttpService } from './algoan-http.service';

describe('AlgoanAnalysisService', () => {
  let algoanAnalysisService: AlgoanAnalysisService;
  let algoanHttpService: AlgoanHttpService;

  beforeEach(async () => {
    // To mock scoped DI
    const contextId = ContextIdFactory.create();
    jest.spyOn(ContextIdFactory, 'getByRequest').mockImplementation(() => contextId);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AlgoanHttpService,
        AlgoanAnalysisService,
        {
          provide: CONFIG,
          useValue: config,
        },
      ],
    }).compile();

    algoanAnalysisService = await moduleRef.resolve<AlgoanAnalysisService>(AlgoanAnalysisService, contextId);
    algoanHttpService = await moduleRef.resolve<AlgoanHttpService>(AlgoanHttpService, contextId);
  });

  it('should be defined', () => {
    expect(algoanAnalysisService).toBeDefined();
  });

  describe('updateAnalysis', () => {
    it('should patch an analysis', async () => {
      const spy = jest.spyOn(algoanHttpService, 'patch').mockReturnValue(Promise.resolve(analysisMock));
      const input: AnalysisUpdateInput = {
        accounts: [],
      };
      const analysis: Analysis = await algoanAnalysisService.updateAnalysis(customerMock.id, analysisMock.id, input);

      expect(spy).toHaveBeenCalledWith(`/v2/customers/${customerMock.id}/analyses/${analysisMock.id}`, input);
      expect(analysis).toBe(analysisMock);
    });
  });
});
