import { HttpService, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Config } from 'node-config-ts';

import { CONFIG } from '../../config/config.module';
import { TinkCategory } from '../dto/category.object';

/**
 * Service to manage transaction
 */
@Injectable()
export class TinkCategoryService implements OnModuleInit {
  constructor(@Inject(CONFIG) private readonly config: Config, private readonly httpService: HttpService) {}

  /**
   * Store Tink categories
   */
  public categories: TinkCategory[];

  /**
   * Method started when the application starts
   * Looks for Tink categories and store them
   */
  public async onModuleInit(): Promise<void> {
    const response: AxiosResponse<TinkCategory[]> = await this.httpService
      .get(`${this.config.tink.apiBaseUrl}/v1/categories`)
      .toPromise();

    this.categories = response.data;
  }

  /**
   * Fetch category code by id
   * @param id Category identifier
   */
  public getCategoryCodeById(id: string): string | undefined {
    return this.categories.find((value: TinkCategory) => value.id === id)?.code;
  }
}
