import { Injectable } from '@nestjs/common';
import { AnalysisUpdateInput } from '../dto/analysis.inputs';
import { Analysis } from '../dto/analysis.objects';
import { AlgoanHttpService } from './algoan-http.service';

/**
 * Service to manage analysis
 */
@Injectable()
export class AlgoanAnalysisService {
  private readonly apiVersion: string = 'v2';

  constructor(private readonly algoanHttpService: AlgoanHttpService) {}

  /**
   * Update the given analysis
   */
  public async updateAnalysis(customerId: string, analysisId: string, input: AnalysisUpdateInput): Promise<Analysis> {
    const path: string = `/${this.apiVersion}/customers/${customerId}/analyses/${analysisId}`;

    return this.algoanHttpService.patch<Analysis, AnalysisUpdateInput>(path, input);
  }
}
