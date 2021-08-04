import { AnalysisStatus } from './analysis.enum';

/**
 * Analysis
 */
export interface Analysis {
  id: string;
  status: AnalysisStatus;
}

/**
 * Details about an occurring error in the analysis
 */
export interface AnalysisError {
  code: string;
  message: string;
}
