import { Injectable } from "@nestjs/common";

import { convertNullToUndefined } from "../../shared/utils/common.utils";

import { TinkSearchQueryInput } from "../dto/search.input";
import { TinkSearchResponseObject, TinkSearchResultObject, TinkTransactionResponseObject } from "../dto/search.objects";

import { TinkHttpService } from "./tink-http.service";


/**
 * Service to manage transaction
 */
@Injectable()
export class TinkTransactionService {
  constructor(
    private readonly tinkHttpService: TinkHttpService,
  ) {}

  /**
   * Get transactions list
   */
  public async getTransactions(
    input?: Omit<TinkSearchQueryInput, 'offset' | 'limit'>
  ): Promise<TinkTransactionResponseObject[]> {
    const transactions: TinkTransactionResponseObject<null>[] = [];
    const nbElementByPage: number = 1000;
    let offset: number = 0;
    let response: TinkSearchResponseObject<null>;

    do {
      response = await this.tinkHttpService
        .post<TinkSearchResponseObject<null>, TinkSearchQueryInput>(
          '/api/v1/search',
          {
            ...input,
            offset,
            limit: nbElementByPage,
          }
        );

      transactions.push(
        ...response.results.map((r: TinkSearchResultObject<null>) => r.transaction),
      );

      offset += nbElementByPage;
    } while(response.count === nbElementByPage)

    return convertNullToUndefined(transactions);
  }
}
