/* eslint-disable @typescript-eslint/naming-convention,camelcase */

/**
 * Input to create a new user
 *
 * @link https://docs.tink.com/api#user-create-user-request-body-createuserrequest
 */
export interface CreateUserInput {
  external_user_id: string;
  locale: string;
  market: string;
}
