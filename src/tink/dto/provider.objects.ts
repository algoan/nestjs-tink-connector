
/**
 * Tink Provider List Response
 *
 * @link https://docs.tink.com/api#provider-list-providers-response-providerlistresponse
 */
export interface TinkProviderListResponseObject {
  providers: TinkProviderObject[];
}

/**
 * Tink Provider
 *
 * Only fields needed
 *
 * @link https://docs.tink.com/api#provider-the-provider-model
 */
export interface TinkProviderObject {
  displayName: string;
  financialInstitutionId: string;
  images?: TinkProviderImageObject;
  market: string;
}

/**
 * Tink Provider Image
 *
 * Only fields needed
 *
 * @link https://docs.tink.com/api#provider-the-provider-model-imageurls
 */
export interface TinkProviderImageObject {
  icon?: string;
}

