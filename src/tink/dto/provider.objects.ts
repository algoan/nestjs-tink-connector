
/**
 * Tink Provider List Response
 *
 * @link https://docs.tink.com/api#provider-list-providers-response-providerlistresponse
 */
export interface TinkProviderListResponseObject<NullOrUndefined = undefined> {
  providers: TinkProviderObject<NullOrUndefined>[];
}

/**
 * Tink Provider
 *
 * Only fields needed
 *
 * @link https://docs.tink.com/api#provider-the-provider-model
 */
export interface TinkProviderObject<NullOrUndefined = undefined> {
  displayName: string;
  financialInstitutionId: string;
  images: TinkProviderImageObject | NullOrUndefined;
  market: string;
}

/**
 * Tink Provider Image
 *
 * Only fields needed
 *
 * @link https://docs.tink.com/api#provider-the-provider-model-imageurls
 */
export interface TinkProviderImageObject<NullOrUndefined = undefined> {
  icon: string | NullOrUndefined;
}

