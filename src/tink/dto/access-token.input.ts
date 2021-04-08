/* eslint-disable @typescript-eslint/naming-convention, camelcase */

import { GrantType } from './grant-type.enum';

/**
 * Input to send to get a new access token
 *
 * @link https://docs.tink.com/api#oauth-get-access-token-form-parameters
 */
export interface AccessTokenInput {
  client_id: string;
  client_secret?: string;
  grant_type: GrantType;
  code?: string;
  refresh_token?: string;
  scope?: string;
  assertion?: string;
}
