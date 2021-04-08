import { ClientPricing } from './service-account.enums';
import { ClientConfig } from './service-account.objects';

/**
 * Client Config
 */
export const serviceAccountConfigMock: ClientConfig = {
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  pricing: ClientPricing.STANDARD,
  market: 'FR',
  locale: 'fr_FR',
};
