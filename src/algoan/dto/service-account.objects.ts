import { ClientPricing } from "./service-account.enums";

/**
 * Client Config
 */
 export interface ClientConfig {
  pricing: ClientPricing;
  market: string;
  locale: string;
}
