/* eslint-disable @typescript-eslint/naming-convention, camelcase */

/**
 * Get args to check account
 *
 * @link https://docs.tink.com/api#tink-link-initialization-parameters
 */
export interface AccountCheckArgs {
  client_id: string;
  redirect_uri: string;
  market: string;
  locale: string;
  scope?: string;
  test: boolean;
  authorization_code?: string;
}
