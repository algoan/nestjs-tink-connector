/* eslint-disable @typescript-eslint/naming-convention */

/**
 * The `actor_client_id` value to delegate authorisation to use tink link
 * 
 * @link https://docs.tink.com/resources/tink-link-web/tink-link-web-permanent-users#generate-a-user-authorization-code
 * 
 * In the authorization grant request you must also specify this constant parameter. 
 * This value represents Tink Link's internal client_id, is constant for all customers and never changes. 
 * By declaring it you are allowing Tink Link to act on your behalf.
 */
export const TINK_LINK_ACTOR_CLIENT_ID: string = 'df05e4b379934cd09963197cc855bfe9';