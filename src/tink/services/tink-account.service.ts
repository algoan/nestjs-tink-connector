import { Injectable } from "@nestjs/common";
import { TinkAccountListResponseObject, TinkAccountObject } from "../dto/account.objects";
import { TinkHttpService } from "./tink-http.service";

/**
 * Service to manage accounts
 */
@Injectable()
export class TinkAccountService {
  constructor(
    private readonly tinkHttpService: TinkHttpService,
  ) {}

  /**
   * Get all accounts of the connected user
   */
  public async getAccounts(): Promise<TinkAccountObject[]> {
    const response: TinkAccountListResponseObject = await this.tinkHttpService
      .get<TinkAccountListResponseObject>('/api/v1/accounts/list');

    return response.accounts
  }
}
