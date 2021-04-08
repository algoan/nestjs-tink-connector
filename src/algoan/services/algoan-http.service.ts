import { RequestBuilder } from '@algoan/rest';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { Config } from 'node-config-ts';

import { CONFIG } from '../../config/config.module';

/**
 * AlgoanHttpService
 */
@Injectable({ scope: Scope.REQUEST })
export class AlgoanHttpService {
  private requestBuilder: RequestBuilder | undefined;

  constructor(@Inject(CONFIG) private readonly config: Config) {}

  /**
   * Authenticate the service to algoan
   */
  public authenticate(clientId: string, clientSecret: string): void {
    this.requestBuilder = new RequestBuilder(
      this.config.algoan.baseUrl,
      {
        clientId,
        clientSecret,
      },
      {
        version: 2,
      },
    );
  }

  /**
   * Do a GET query
   */
  public async get<ReturnType>(path: string): Promise<ReturnType> {
    return this.request({ url: path, method: 'GET' });
  }

  /**
   * Do a PATCH query
   */
  public async patch<ReturnType, InputType>(path: string, input: InputType): Promise<ReturnType> {
    return this.request({ url: path, method: 'PATCH', data: input });
  }

  /**
   * Do a POST query
   */
  public async post<ReturnType, InputType>(path: string, input: InputType): Promise<ReturnType> {
    return this.request({ url: path, method: 'POST', data: input });
  }

  /**
   * Do a request to algoan
   */
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    if (this.requestBuilder === undefined) {
      throw new Error('You should be authenticated before requesting Algoan');
    }

    return this.requestBuilder.request(config);
  }
}
