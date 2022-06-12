import { Injectable } from '@nestjs/common';

import { convertNullToUndefined } from '../../shared/utils/common.utils';

import { TinkSearchQueryInput } from '../dto/search.input';
import {
  ExtendedTinkTransactionResponseObject,
  TinkSearchResponseObject,
  TinkSearchResultObject,
} from '../dto/search.objects';
import {
  TinkV2GetTransactionsQueryParameters,
  TinkV2GetTransactionsResponseObject,
  TinkV2TransactionObject,
} from '../dto/transaction-v2.object';
import { TinkCategoryService } from './tink-category.service';

import { TinkHttpService } from './tink-http.service';

/**
 * Service to manage transaction
 */
@Injectable()
export class TinkTransactionService {
  constructor(
    private readonly tinkHttpService: TinkHttpService,
    private readonly tinkCategoryService: TinkCategoryService,
  ) {}

  /**
   * Get transactions list
   */
  public async getTransactions(
    input?: Omit<TinkSearchQueryInput, 'offset' | 'limit'>,
  ): Promise<ExtendedTinkTransactionResponseObject[]> {
    const transactions: ExtendedTinkTransactionResponseObject<null>[] = [];
    const nbElementByPage: number = 1000;
    let offset: number = 0;
    let response: TinkSearchResponseObject<null>;

    do {
      response = await this.tinkHttpService.post<TinkSearchResponseObject<null>, TinkSearchQueryInput>(
        '/api/v1/search',
        {
          ...input,
          offset,
          limit: nbElementByPage,
        },
      );

      transactions.push(
        ...response.results.map((r: TinkSearchResultObject<null>) => ({
          ...r.transaction,
          categoryCode: this.tinkCategoryService.getCategoryCodeById(r.transaction.categoryId),
        })),
      );

      offset += nbElementByPage;
    } while (response.count === nbElementByPage);

    return convertNullToUndefined(transactions);
  }

  /**
   * Get all transactions of an account of the connected user using Tink V2 APIs
   */
  public async getTransactionsV2(accountId: string): Promise<TinkV2TransactionObject[]> {
    let response: TinkV2GetTransactionsResponseObject<null>;
    const transactions: TinkV2TransactionObject<null>[] = [];
    const queryParameters: TinkV2GetTransactionsQueryParameters = {
      accountIdIn: accountId,
      pageSize: 1000,
    };

    do {
      response = await this.tinkHttpService.get<TinkV2GetTransactionsResponseObject<null>>('/data/v2/transactions', {
        ...queryParameters,
      });

      transactions.push(...response.transactions);
      queryParameters.pageToken = response.nextPageToken;
    } while (queryParameters.pageToken !== '');

    return convertNullToUndefined(transactions);
  }
}
