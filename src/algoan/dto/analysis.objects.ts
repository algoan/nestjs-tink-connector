import { AnalysisStatus } from './analysis.enum';

/**
 * Analysis
 */
export interface Analysis {
  id: string;
  status: AnalysisStatus;
}
