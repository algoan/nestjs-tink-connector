/**
 * Input to create an authorization code
 *
 * @link https://docs.tink.com/api#general/oauth/create-authorization
 */
export interface CreateAuthorizationCode {
  user_id?: string;
  scope: string;
}
