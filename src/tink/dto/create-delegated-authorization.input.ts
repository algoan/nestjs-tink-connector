/* eslint-disable @typescript-eslint/naming-convention,camelcase */

/**
 * Inptut to create a delegated authorization
 *
 * @link https://docs.tink.com/api#oauth-create-delegated-authorization-form-parameters
 */
export interface CreateDelegatedAuthorizationInput {
  user_id: string;
  // external_user_id?: string; // We will only use the tink user_id
  id_hint: string;
  actor_client_id: string;
  scope: string;
}
