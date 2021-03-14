import { Inject, Injectable } from "@nestjs/common";
import { Config } from "node-config-ts";

import { TinkProviderListResponseObject, TinkProviderObject } from "../dto/provider.objects";
import { TinkProviderListArgs } from "../dto/provider.args";

import { CONFIG } from "../../config/config.module";
import { TinkHttpService } from "./tink-http.service";

/**
 * Service to manage provider
 */
@Injectable()
export class TinkProviderService {
  constructor(
    @Inject(CONFIG) private readonly config: Config,
    private readonly tinkHttpService: TinkHttpService,
  ) {}

  /**
   * Get all providers of the connected user
   */
  public async getProviders(): Promise<TinkProviderObject[]> {
    const args: TinkProviderListArgs = {
      includeTestProviders: this.config.tink.test,
      excludeNonTestProviders: this.config.tink.test,
    };

    const response: TinkProviderListResponseObject = await this.tinkHttpService
      .get<TinkProviderListResponseObject, TinkProviderListArgs>('/api/v1/providers', args);

    return response.providers;
  }
}
