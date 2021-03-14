import { TinkSearchQuerySortField } from "./search.enum"
import { TinkOrder } from "./shared.enums"

/**
 * Search Input
 *
 * @link https://docs.tink.com/api#search-query-transactions-request-body-searchquery
 */
export interface TinkSearchQueryInput {
  accounts?: string[],
  categories?: string[],
  startDate?: number, // timestamp
  endDate?: number, // timestamp
  externalIds?: string[],
  includeUpcoming?: boolean,
  offset?: number,
  limit?: number,
  maxAmount?: number,
  minAmount?: number,
  queryString?: string, // https://docs.tink.com/api#search-query-transactions-query-string-commands
  sort?: TinkSearchQuerySortField,
  order?: TinkOrder,
}
