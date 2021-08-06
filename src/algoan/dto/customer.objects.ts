import { AggregationDetailsMode, AggregationDetailsAggregatorName } from './customer.enums';

/**
 * Customer
 */
export interface Customer {
  id: string;
  customIdentifier: string;
  aggregationDetails: AggregationDetails;
  personalDetails?: PersonalDetails;
}

/**
 * Aggregation Details
 */
export interface AggregationDetails {
  aggregatorName?: AggregationDetailsAggregatorName;
  callbackUrl?: string;
  token?: string;
  mode?: AggregationDetailsMode;
  redirectUrl?: string;
  apiUrl?: string;
  iframeUrl?: string;
  userId?: string;
  clientId?: string;
}

/**
 * Personal Details
 */
export interface PersonalDetails {
  identity?: PersonalDetailsIdentity;
  contact?: PersonalDetailsContact;
}

/**
 * Personal Details Identity
 */
export interface PersonalDetailsIdentity {
  firstName?: string;
  lastName?: string;
  birthName?: string;
  birthDate?: string;
  birthCity?: string;
  birthZipCode?: string;
  birthCountry?: string;
}

/**
 * Personal Details Contact
 */
export interface PersonalDetailsContact {
  email?: string;
  phoneNumber?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}
