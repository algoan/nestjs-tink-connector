import { Injectable } from '@nestjs/common';

import { convertNullToUndefined } from '../../shared/utils/common.utils';

import { TinkAccountListResponseObject, TinkAccountObject } from '../dto/account.objects';

import {
  TinkV2AccountObject,
  TinkV2GetAccountsQueryParameters,
  TinkV2GetAccountsResponseObject,
} from '../dto/account-v2.object';
import { TinkHttpService } from './tink-http.service';

/**
 * Service to manage accounts
 */
@Injectable()
export class TinkAccountService {
  constructor(private readonly tinkHttpService: TinkHttpService) {}

  /**
   * Get all accounts of the connected user using Tink V1 APIs
   */
  public async getAccounts(): Promise<TinkAccountObject[]> {
    const response: TinkAccountListResponseObject<null> = await this.tinkHttpService.get<
      TinkAccountListResponseObject<null>
    >('/api/v1/accounts/list');

    return convertNullToUndefined(response.accounts);
  }

  /**
   * Get all accounts of the connected user using Tink V2 APIs
   */
  public async getAccountsV2(): Promise<TinkV2AccountObject[]> {
    let response: TinkV2GetAccountsResponseObject<null>;
    const accounts: TinkV2AccountObject<null>[] = [];
    const queryParameters: TinkV2GetAccountsQueryParameters = {
      pageSize: 100,
    };

    do {
      response = await this.tinkHttpService.get<TinkV2GetAccountsResponseObject<null>>('/data/v2/accounts', {
        ...queryParameters,
      });
      accounts.push(...response.accounts);
      queryParameters.pageToken = response.nextPageToken;
    } while (queryParameters.pageToken !== '');

    return convertNullToUndefined(accounts);
  }
}
