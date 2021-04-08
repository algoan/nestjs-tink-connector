import { Injectable } from '@nestjs/common';

import { convertNullToUndefined } from '../../shared/utils/common.utils';

import { TinkAccountListResponseObject, TinkAccountObject } from '../dto/account.objects';

import { TinkHttpService } from './tink-http.service';

/**
 * Service to manage accounts
 */
@Injectable()
export class TinkAccountService {
  constructor(private readonly tinkHttpService: TinkHttpService) {}

  /**
   * Get all accounts of the connected user
   */
  public async getAccounts(): Promise<TinkAccountObject[]> {
    const response: TinkAccountListResponseObject<null> = await this.tinkHttpService.get<
      TinkAccountListResponseObject<null>
    >('/api/v1/accounts/list');

    return convertNullToUndefined(response.accounts);
  }
}
