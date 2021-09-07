import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { ClientPricing } from './service-account.enums';

/**
 * Client Config
 */
export class ClientConfig {
  @IsString()
  public clientId: string;

  @IsString()
  public clientSecret: string;

  @IsEnum(ClientPricing)
  public pricing: ClientPricing;

  @IsString()
  public market: string;

  @IsString()
  public locale: string;

  @IsBoolean()
  public realDataTest: boolean;
}
