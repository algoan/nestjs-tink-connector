/* eslint-disable @typescript-eslint/naming-convention,camelcase */
import * as qs from 'qs';
import { HttpModule, HttpService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { config } from 'node-config-ts';
import { of } from 'rxjs';
import { ContextIdFactory } from '@nestjs/core';

import { serviceAccountConfigMock } from '../../algoan/dto/service-account.objects.mock';
import { CONFIG } from '../../config/config.module';

import { AccessTokenInput } from '../dto/access-token.input';
import { AccessTokenObject } from '../dto/access-token.object';
import { accessTokenObjectMock } from '../dto/access-token.object.mock';
import { GrantType } from '../dto/grant-type.enum';

import { TinkHttpService } from './tink-http.service';

describe('TinkHttpService', () => {
  let tinkHttpService: TinkHttpService;
  let httpService: HttpService;

  beforeEach(async () => {
    // To mock scoped DI
    const contextId = ContextIdFactory.create();
    jest.spyOn(ContextIdFactory, 'getByRequest').mockImplementation(() => contextId);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        TinkHttpService,
        {
          provide: CONFIG,
          useValue: config,
        },
      ],
    }).compile();

    tinkHttpService = await moduleRef.resolve<TinkHttpService>(TinkHttpService, contextId);
    httpService = await moduleRef.resolve<HttpService>(HttpService, contextId);
  });

  it('should be defined', () => {
    expect(tinkHttpService).toBeDefined();
  });

  /**
   * @link https://docs.tink.com/api#oauth-get-access-token
   */
  describe('authenticateAsUserWithCode', () => {
    let spy;

    beforeEach(async () => {
      spy = jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of({ data: accessTokenObjectMock } as AxiosResponse<AccessTokenObject>));
    });

    it('should request a token with a code', async () => {
      const url: string = `${config.tink.apiBaseUrl}/api/v1/oauth/token`;
      const code: string = `CODE-${process.pid}`;
      const input: AccessTokenInput = {
        client_id: serviceAccountConfigMock.clientId,
        client_secret: serviceAccountConfigMock.clientSecret,
        grant_type: GrantType.AUTHORIZATION_CODE,
        code,
      };
      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      await tinkHttpService.authenticateAsUserWithCode(
        serviceAccountConfigMock.clientId,
        serviceAccountConfigMock.clientSecret,
        code,
      );

      expect(spy).toHaveBeenCalledWith(url, qs.stringify(input), { headers });
    });
  });

  /**
   * @link https://docs.tink.com/api#oauth-get-access-token
   */
  describe('authenticateAsClientWithCredentials', () => {
    let spy;

    beforeEach(async () => {
      spy = jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of({ data: accessTokenObjectMock } as AxiosResponse<AccessTokenObject>));
    });
    it('should request a token with credentials', async () => {
      const url: string = `${config.tink.apiBaseUrl}/api/v1/oauth/token`;
      const input: AccessTokenInput = {
        client_id: serviceAccountConfigMock.clientId,
        client_secret: serviceAccountConfigMock.clientSecret,
        grant_type: GrantType.CLIENT_CREDENTIALS,
        scope: 'authorization:grant,user:read,user:create',
      };
      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      await tinkHttpService.authenticateAsClientWithCredentials(
        serviceAccountConfigMock.clientId,
        serviceAccountConfigMock.clientSecret,
      );

      expect(spy).toHaveBeenCalledWith(url, qs.stringify(input), { headers });
    });
  });

  describe('get', () => {
    it('should send a get request if authenticated', async () => {
      // mock authentication
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of({ data: accessTokenObjectMock } as AxiosResponse<AccessTokenObject>));

      // authenticate
      await tinkHttpService.authenticateAsClientWithCredentials(
        serviceAccountConfigMock.clientId,
        serviceAccountConfigMock.clientSecret,
      );

      // mock get
      const spy = jest.spyOn(httpService, 'get').mockReturnValue(of({ data: 'test' } as AxiosResponse<string>));

      // get result
      const result: string = await tinkHttpService.get('/my/path');

      expect(spy).toHaveBeenCalledWith(`${config.tink.apiBaseUrl}/my/path`, {
        headers: { Authorization: 'Bearer user_id' },
      });
      expect(result).toBe('test');
    });

    it('should send a get request with args', async () => {
      // mock authentication
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of({ data: accessTokenObjectMock } as AxiosResponse<AccessTokenObject>));

      // authenticate
      await tinkHttpService.authenticateAsClientWithCredentials(
        serviceAccountConfigMock.clientId,
        serviceAccountConfigMock.clientSecret,
      );

      // mock get
      const spy = jest.spyOn(httpService, 'get').mockReturnValue(of({ data: 'test' } as AxiosResponse<string>));

      const args = {
        param: `param-${process.pid}`,
      };

      // get result with args
      const result: string = await tinkHttpService.get('/my/path', args);

      expect(spy).toHaveBeenCalledWith(`${config.tink.apiBaseUrl}/my/path?${qs.stringify(args)}`, {
        headers: { Authorization: 'Bearer user_id' },
      });
      expect(result).toBe('test');
    });

    it('should throw an error if NOT authenticated', async () => {
      await expect(tinkHttpService.get('/my/path')).rejects.toThrowError();
    });
  });

  describe('post', () => {
    it('should send a post request if authenticated', async () => {
      // mock authentication
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of({ data: accessTokenObjectMock } as AxiosResponse<AccessTokenObject>));

      // authenticate
      await tinkHttpService.authenticateAsClientWithCredentials(
        serviceAccountConfigMock.clientId,
        serviceAccountConfigMock.clientSecret,
      );

      // mock post
      const spy = jest.spyOn(httpService, 'post').mockReturnValue(of({ data: 'test' } as AxiosResponse<string>));

      // post
      const input = { myField: 'myField' };
      const result: string = await tinkHttpService.post('/my/path', input);

      expect(spy).toHaveBeenCalledWith(`${config.tink.apiBaseUrl}/my/path`, input, {
        headers: { Authorization: 'Bearer user_id' },
      });
      expect(result).toBe('test');
    });

    it('should send a post request in url encoded format', async () => {
      // mock authentication
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of({ data: accessTokenObjectMock } as AxiosResponse<AccessTokenObject>));

      // authenticate
      await tinkHttpService.authenticateAsClientWithCredentials(
        serviceAccountConfigMock.clientId,
        serviceAccountConfigMock.clientSecret,
      );

      // mock post
      const spy = jest.spyOn(httpService, 'post').mockReturnValue(of({ data: 'test' } as AxiosResponse<string>));

      // post
      const input = { myField: 'myField' };
      const result: string = await tinkHttpService.post('/my/path', input, true);

      expect(spy).toHaveBeenCalledWith(`${config.tink.apiBaseUrl}/my/path`, qs.stringify(input), {
        headers: {
          Authorization: 'Bearer user_id',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      expect(result).toBe('test');
    });

    it('should throw an error if NOT authenticated', async () => {
      const input = { myField: 'myField' };
      await expect(tinkHttpService.post('/my/path', input)).rejects.toThrowError();
    });
  });

  describe('patch', () => {
    it('should send a patch request if authenticated', async () => {
      // mock authentication
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of({ data: accessTokenObjectMock } as AxiosResponse<AccessTokenObject>));

      // authenticate
      await tinkHttpService.authenticateAsClientWithCredentials(
        serviceAccountConfigMock.clientId,
        serviceAccountConfigMock.clientSecret,
      );

      const spy = jest.spyOn(httpService, 'patch').mockReturnValue(of({ data: 'test' } as AxiosResponse<string>));

      // patch
      const input = { myField: 'myField' };
      const result: string = await tinkHttpService.patch('/my/path', input);

      // mock patch
      expect(spy).toHaveBeenCalledWith(`${config.tink.apiBaseUrl}/my/path`, input, {
        headers: { Authorization: 'Bearer user_id' },
      });
      expect(result).toBe('test');
    });

    it('should send a patch request in url encoded format', async () => {
      // mock authentication
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(of({ data: accessTokenObjectMock } as AxiosResponse<AccessTokenObject>));

      // authenticate
      await tinkHttpService.authenticateAsClientWithCredentials(
        serviceAccountConfigMock.clientId,
        serviceAccountConfigMock.clientSecret,
      );

      // mock patch
      const spy = jest.spyOn(httpService, 'patch').mockReturnValue(of({ data: 'test' } as AxiosResponse<string>));

      // patch
      const input = { myField: 'myField' };
      const result: string = await tinkHttpService.patch('/my/path', input, true);

      expect(spy).toHaveBeenCalledWith(`${config.tink.apiBaseUrl}/my/path`, qs.stringify(input), {
        headers: {
          Authorization: 'Bearer user_id',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      expect(result).toBe('test');
    });

    it('should throw an error if NOT authenticated', async () => {
      const input = { myField: 'myField' };
      await expect(tinkHttpService.patch('/my/path', input)).rejects.toThrowError();
    });
  });
});
