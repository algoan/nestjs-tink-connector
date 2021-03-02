import { IsNotEmpty } from 'class-validator';

/**
 * ServiceAccountCreated DTO
 */
export class ServiceAccountCreatedDTO {
  /**
   * Unique service account identifier
   */
  @IsNotEmpty()
  public readonly serviceAccountId: string;
}
