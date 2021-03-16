/* eslint-disable @typescript-eslint/naming-convention */

/**
 * Enum for the grant type field when get an access token
 *
 * @link https://docs.tink.com/api#oauth-get-access-token
 */
 export enum GrantType {
  AUTHORIZATION_CODE = 'authorization_code',
  REFRESH_TOKEN = 'refresh_token',
  CLIENT_CREDENTIALS = 'client_credentials',
  JWT_BEARER = 'urn:ietf:params:oauth:grant-type:jwt-bearer',
}
