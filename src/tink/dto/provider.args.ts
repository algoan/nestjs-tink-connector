
/**
 * Tink Provider List args
 *
 * @link https://docs.tink.com/api#provider-list-providers-query-parameters
 */
export interface TinkProviderListArgs {
  capability?: string;
  includeTestProviders?: boolean;
  excludeNonTestProviders?: boolean;
  name?: string;
}
