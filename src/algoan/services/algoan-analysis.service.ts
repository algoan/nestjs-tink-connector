import { Injectable } from "@nestjs/common";
import { AnalysisUpdateInput } from "../dto/analysis.inputs";
import { Analysis } from "../dto/analysis.objects";
import { AlgoanHttpService } from "./algoan-http.service";

/**
 * Service to manage analysis
 */
@Injectable()
export class AlgoanAnalysisService {
  private readonly apiVersion: string = 'v2';

  constructor(
    private readonly algoanHttpService: AlgoanHttpService,
  ) {}

  /**
   * Update the given analysis
   */
  public async updateAnalysis(id: string, input: AnalysisUpdateInput): Promise<Analysis> {
    const path: string = `/${this.apiVersion}/analysis/${id}`;

    return this.algoanHttpService.patch<Analysis, AnalysisUpdateInput>(path, input);
  }
}
