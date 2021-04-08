import { TinkProviderObject, TinkProviderImageObject, TinkProviderListResponseObject } from './provider.objects';

/**
 * Mock for a Tink Provider Image
 */
export const tinkProviderImageObjectMock: TinkProviderImageObject = {
  icon: 'https://cdn.tink.se/provider-images/tink.png',
};

/**
 * Mock for a Tink Provider
 */
export const tinkProviderObjectMock: TinkProviderObject = {
  displayName: 'Bink',
  financialInstitutionId: '6e68cc6287704273984567b3300c5822',
  images: tinkProviderImageObjectMock,
  market: 'FR',
};

/**
 * Mock for a Tink Provider List Response
 */
export const tinkProviderListResponseObjectMock: TinkProviderListResponseObject = {
  providers: [tinkProviderObjectMock],
};
