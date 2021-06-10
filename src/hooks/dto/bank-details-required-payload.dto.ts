import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
/**
 * Payload for event `bank_details_required`
 */
export class BankDetailsRequiredDTO {
  /**
   * Customer identifier
   */
  @IsString()
  @IsNotEmpty()
  public customerId: string;

  /**
   * Analysis ID
   */
  @IsString()
  @IsNotEmpty()
  public analysisId: string;

  /**
   * Temp code to convert to an access token
   *
   * If not defined, the event is considered as a refresh
   */
  @IsOptional()
  @IsString()
  public temporaryCode?: string;
}
