import { ClientPricing } from "./service-account.enums";

/**
 * Client Config
 */
export interface ClientConfig {
  clientId: string;
  clientSecret: string;
  pricing: ClientPricing;
  market: string;
  locale: string;
}
