/* eslint-disable @typescript-eslint/naming-convention,camelcase */

/**
 * Object response when we have create a new user
 *
 * @link https://docs.tink.com/api#user-create-user-response-createuserresponse
 */
export interface CreateUserObject {
  external_user_id: string;
  user_id: string;
}
