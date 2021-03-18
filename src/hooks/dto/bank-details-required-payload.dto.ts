import { IsNotEmpty, IsString } from 'class-validator';
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
   */
  @IsString()
  @IsNotEmpty()
  public temporaryCode: string;
}
