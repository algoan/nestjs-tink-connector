import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Payload for event `aggregator_link_required`
 */
export class AggregatorLinkRequiredDTO {
  /**
   * Customer identifier
   */
  @IsString()
  @IsNotEmpty()
  public customerId: string;
}
