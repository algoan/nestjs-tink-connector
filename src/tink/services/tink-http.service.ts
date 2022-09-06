/* eslint-disable @typescript-eslint/naming-convention, camelcase */
import * as qs from 'qs';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Config } from 'node-config-ts';

import { CONFIG } from '../../config/config.module';

import { AccessTokenInput } from '../dto/access-token.input';
import { AccessTokenObject } from '../dto/access-token.object';
import { GrantType } from '../dto/grant-type.enum';
import { toPromise } from '../../shared/utils/common.utils';

/**
 * Service to request tink APIs
 */
@Injectable({ scope: Scope.REQUEST })
export class TinkHttpService {
  private tokenInfo: AccessTokenObject | undefined;

  constructor(@Inject(CONFIG) private readonly config: Config, private readonly httpService: HttpService) {}

  /**
   * Authenticate the service to tink
   */
  public async authenticateAsClientWithCredentials(clientId: string, clientSecret: string): Promise<void> {
    const input: AccessTokenInput = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: GrantType.CLIENT_CREDENTIALS,
      scope: 'authorization:grant,user:create',
    };

    return this.authenticate(input);
  }

  /**
   * Authenticate the service to tink
   */
  public async authenticateAsClientWithRefreshToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string,
  ): Promise<void> {
    const input: AccessTokenInput = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: GrantType.REFRESH_TOKEN,
      refresh_token: refreshToken,
    };

    return this.authenticate(input);
  }

  /**
   * Authenticate the service to tink
   */
  public async authenticateAsUserWithCode(clientId: string, clientSecret: string, code: string): Promise<void> {
    const input: AccessTokenInput = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: GrantType.AUTHORIZATION_CODE,
      code,
    };

    return this.authenticate(input);
  }

  /**
   * Do a GET query
   */
  public async get<ReturnType, ArgsType = unknown>(path: string, args?: ArgsType): Promise<ReturnType> {
    const response: AxiosResponse<ReturnType> = await toPromise(
      this.httpService.get<ReturnType>(
        `${this.config.tink.apiBaseUrl}${path}${args !== undefined ? `?${qs.stringify(args)}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
          },
        },
      ),
    );

    return response.data;
  }

  /**
   * Do a POST query
   */
  public async post<ReturnType, InputType>(
    path: string,
    input: InputType,
    urlEncoded: boolean = false,
  ): Promise<ReturnType> {
    const response: AxiosResponse<ReturnType> = await toPromise(
      this.httpService.post<ReturnType>(
        `${this.config.tink.apiBaseUrl}${path}`,
        urlEncoded ? qs.stringify(input) : input,
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
            ...(urlEncoded ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
          },
        },
      ),
    );

    return response.data;
  }

  /**
   * Do a PATCH request
   */
  public async patch<ReturnType, InputType>(
    path: string,
    input: InputType,
    urlEncoded: boolean = false,
  ): Promise<ReturnType> {
    const response: AxiosResponse<ReturnType> = await toPromise(
      this.httpService.patch<ReturnType>(
        `${this.config.tink.apiBaseUrl}${path}`,
        urlEncoded ? qs.stringify(input) : input,
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
            ...(urlEncoded ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
          },
        },
      ),
    );

    return response.data;
  }

  /**
   * Get tink refresh token
   */
  public getRefreshToken(): string {
    if (this.tokenInfo === undefined) {
      throw new Error('You should be authenticated before requesting Tink');
    }

    return this.tokenInfo.refresh_token;
  }

  /**
   * Get tink http headers
   */
  private getToken(): string {
    if (this.tokenInfo === undefined) {
      throw new Error('You should be authenticated before requesting Tink');
    }

    return this.tokenInfo.access_token;
  }

  /**
   * Authenticate the service to tink
   */
  private async authenticate(input: AccessTokenInput): Promise<void> {
    const authResponse: AxiosResponse<AccessTokenObject> = await toPromise(
      this.httpService.post<AccessTokenObject>(
        `${this.config.tink.apiBaseUrl}/api/v1/oauth/token`,
        qs.stringify(input),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    this.tokenInfo = authResponse.data;
  }
}
