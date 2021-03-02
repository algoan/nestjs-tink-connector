import { IsNotEmpty } from 'class-validator';

/**
 * Service account deleted DTO
 */
export class ServiceAccountDeletedDTO {
  /**
   * Unique service account DTO
   */
  @IsNotEmpty()
  public readonly serviceAccountId: string;
}
