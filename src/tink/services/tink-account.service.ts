import { Injectable } from "@nestjs/common";
import { TinkHttpService } from "./tink-http.service";


/**
 * Service to manage accounts
 */
@Injectable()
export class TinkAccountService {
  constructor(
    private readonly tinkHttpService: TinkHttpService,
  ) {}
}
