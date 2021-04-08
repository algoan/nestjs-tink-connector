import { AggregationDetailsMode, AggregationDetailsAggregatorName } from './customer.enums';
import { AggregationDetails, PersonalDetails } from './customer.objects';

/**
 * Mock for `AggregationDetails` object
 */
export const aggregationDetailsMock: AggregationDetails = {
  aggregatorName: AggregationDetailsAggregatorName.tink,
  callbackUrl: 'callbackUrl',
  token: 'token',
  mode: AggregationDetailsMode.redirect,
  redirectUrl: 'redirectUrl',
  apiUrl: 'apiUrl',
  userId: undefined,
  clientId: 'clientId',
};

/**
 * Mock for `PersonalDetailsIdentity` object
 */
export const personalDetailsIdentityMock = {
  firstName: 'firstName',
  lastName: 'lastName',
  birthName: 'birthName',
  birthDate: 'birthDate',
  birthCity: 'birthCity',
  birthZipCode: 'birthZipCode',
  birthCountry: 'birthCountry',
};

/**
 * Mock for `PersonalDetailsContact` object
 */
export const personalDetailsContactMock = {
  email: 'email',
  phoneNumber: 'phoneNumber',
  street: 'street',
  city: 'city',
  zipCode: 'zipCode',
  country: 'country',
};

/**
 * Mock for `PersonalDetails` object
 */
export const personalDetailsMock: PersonalDetails = {
  identity: personalDetailsIdentityMock,
  contact: personalDetailsContactMock,
};

/**
 * Mock for `Customer` object
 */
export const customerMock = {
  id: '5f58a224aa55a30021bc7ab4',
  customIdentifier: 'customIdentifier',
  aggregationDetails: aggregationDetailsMock,
  personalDetails: personalDetailsMock,
};
