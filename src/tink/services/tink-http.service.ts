/* eslint-disable @typescript-eslint/naming-convention, camelcase */
import * as qs from 'qs';
import { HttpService, Inject, Injectable, Scope } from "@nestjs/common";
import { AxiosResponse } from "axios";
import { Config } from "node-config-ts";

import { CONFIG } from "../../config/config.module";

import { AccessTokenInput } from "../dto/access-token.input";
import { AccessTokenObject } from "../dto/access-token.object";
import { GrantType } from "../dto/grant-type.enum";

/**
 * Service to request tink APIs
 */
@Injectable({scope: Scope.REQUEST})
export class TinkHttpService {
  private tokenInfo: AccessTokenObject | undefined;

  constructor(
    @Inject(CONFIG) private readonly config: Config,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Authenticate the service to tink
   */
  public async authenticate(code?: string): Promise<void> {
    const input: AccessTokenInput =
      code !== undefined
        ? {
            client_id: this.config.tink.clientId,
            grant_type: GrantType.AUTHORIZATION_CODE,
            code,
          }
        : {
            client_id: this.config.tink.clientId,
            client_secret: this.config.tink.clientSecret,
            grant_type: GrantType.CLIENT_CREDENTIALS,
            scope: 'authorization:grant,user:read,user:create',
          };

    const authResponse: AxiosResponse<AccessTokenObject> = await this.httpService
      .post<AccessTokenObject>(
        `${this.config.tink.apiBaseUrl}/api/v1/oauth/token`,
        qs.stringify(input),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      )
      .toPromise();

    this.tokenInfo = authResponse.data;
  }

  /**
   * Do a GET query
   */
  public async get<ReturnType>(path: string): Promise<ReturnType> {
    const response: AxiosResponse<ReturnType> = await this.httpService
      .get<ReturnType>(
        `${this.config.tink.apiBaseUrl}${path}`,
        {
          headers: {
            Authorization: `Beared ${this.getToken()}`,
          }
        },
      )
      .toPromise();

    return response.data;
  }

  /**
   * Do a POST query
   */
  public async post<ReturnType, InputType>(path: string, input: InputType, urlEncoded: boolean = false): Promise<ReturnType> {
    const response: AxiosResponse<ReturnType> = await this.httpService
      .post<ReturnType>(
        `${this.config.tink.apiBaseUrl}${path}`,
        urlEncoded ? qs.stringify(input) : input,
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
            ...( urlEncoded ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
          }
        }
      )
      .toPromise();

    return response.data;
  }

  /**
   * Do a PATCH request
   */
  public async patch<ReturnType, InputType>(path: string, input: InputType, urlEncoded: boolean = false): Promise<ReturnType> {
    const response: AxiosResponse<ReturnType> = await this.httpService
      .patch<ReturnType>(
        `${this.config.tink.apiBaseUrl}${path}`,
        urlEncoded ? qs.stringify(input) : input,
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
            ...( urlEncoded ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {})
          }
        }
      )
      .toPromise();

    return response.data;
  }

  /**
   * Get tink http headers
   */
  private getToken(): string {
    if (this.tokenInfo === undefined) {
      throw new Error('You should be authenticated before requesting Tink')
    }

    return this.tokenInfo.access_token;
  }
}