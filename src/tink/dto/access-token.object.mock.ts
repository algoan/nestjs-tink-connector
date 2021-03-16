/* eslint-disable @typescript-eslint/naming-convention, camelcase */

import { AccessTokenObject } from "./access-token.object";

/**
 * Mock of a new token
 */
export const accessTokenObjectMock: AccessTokenObject = {
  access_token: 'user_id',
  expires_in: 3600,
  id_hint: 'id_hint',
  refresh_token: 'refresh_token',
  scope: 'scope',
  token_type: 'token_type',
}
