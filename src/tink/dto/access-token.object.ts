/* eslint-disable @typescript-eslint/naming-convention, camelcase */

/**
 * Response object when we get a new access token
 *
 * @link https://docs.tink.com/api#oauth-get-access-token-response-oauth2authenticationtokenresponse
 */
export interface AccessTokenObject {
  access_token: string;
  expires_in: number;
  id_hint: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}
