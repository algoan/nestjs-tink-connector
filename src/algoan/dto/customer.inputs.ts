/**
 * Customer Update Input
 */
export interface CustomerUpdateInput {
  aggregationDetails?: AggregationDetailsUpdateInput;
}

/**
 * Aggregation Details Update Input
 */
export interface AggregationDetailsUpdateInput {
  callbackUrl?: string;
  token?: string;
  redirectUrl?: string;
  apiUrl?: string;
  iframeUrl?: string;
  userId?: string;
  clientId?: string;
  aggregatorName?: string;
}
