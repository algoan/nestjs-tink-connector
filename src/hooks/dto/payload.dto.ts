import { IsNotEmpty, IsString } from 'class-validator';
/**
 * Payload property
 */
export class PayloadDTO {
  /**
   * Customer identifier
   */
  @IsString()
  @IsNotEmpty()
  public customerId: string;
}
