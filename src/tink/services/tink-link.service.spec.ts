/* eslint-disable @typescript-eslint/naming-convention, camelcase */
import * as qs from 'qs';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'node-config-ts';

import { serviceAccountConfigMock } from '../../algoan/dto/service-account.objects.mock';
import { CONFIG } from '../../config/config.module';

import { AccountCheckArgs } from '../dto/account-check.args';

import { TinkLinkService } from './tink-link.service';

describe('TinkLinkService', () => {
  let tinkLinkService: TinkLinkService;

  describe('getAuthorizeLink', () => {
    beforeEach(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        providers: [
          TinkLinkService,
          {
            provide: CONFIG,
            useValue: config,
          },
        ],
      }).compile();

      tinkLinkService = moduleRef.get<TinkLinkService>(TinkLinkService);
    });

    it('should be defined', async () => {
      expect(tinkLinkService).toBeDefined();
    });

    it('should return a Tink Link V1 WITH the authorizationCode', async () => {
      const redirectUri: string = `http://callBackUrl/redirect-${process.pid}`;
      const market: string = `FR-${process.pid}`;
      const locale: string = `fr_FR-${process.pid}`;
      const scope: string = `scope-${process.pid}`;
      const authorizationCode: string = `authorizationCode-${process.pid}`;

      const args: AccountCheckArgs = {
        client_id: serviceAccountConfigMock.clientId,
        redirect_uri: redirectUri,
        market,
        locale,
        scope,
        test: true,
        authorization_code: authorizationCode,
      };

      const link: string = `${config.tink.linkBaseUrl}/1.0/authorize?${qs.stringify(args)}`;

      expect(tinkLinkService.getAuthorizeLink(args, false)).toEqual(link);
    });

    it('should return a Tink Link V2 WITH the authorizationCode', async () => {
      const redirectUri: string = `http://callBackUrl/redirect-${process.pid}`;
      const market: string = `FR-${process.pid}`;
      const locale: string = `fr_FR-${process.pid}`;

      const args: AccountCheckArgs = {
        client_id: serviceAccountConfigMock.clientId,
        redirect_uri: redirectUri,
        market,
        locale,
        test: true,
      };

      const link: string = `${config.tink.linkBaseUrl}/1.0/transactions/connect-account?${qs.stringify(args)}`;

      expect(tinkLinkService.getAuthorizeLink(args, true)).toEqual(link);
    });

    it('should return a Tink Link V1 WITHOUT authorizationCode', async () => {
      const redirectUri: string = `http://callBackUrl/redirect-${process.pid}`;
      const market: string = `FR-${process.pid}`;
      const locale: string = `fr_FR-${process.pid}`;
      const scope: string = `scope-${process.pid}`;

      const args: AccountCheckArgs = {
        client_id: serviceAccountConfigMock.clientId,
        redirect_uri: redirectUri,
        market,
        locale,
        scope,
        test: true,
      };

      const link: string = `${config.tink.linkBaseUrl}/1.0/authorize?${qs.stringify(args)}`;

      expect(tinkLinkService.getAuthorizeLink(args, false)).toEqual(link);
    });

    it('should return a Tink Link V2 WITHOUT authorizationCode', async () => {
      const redirectUri: string = `http://callBackUrl/redirect-${process.pid}`;
      const market: string = `FR-${process.pid}`;
      const locale: string = `fr_FR-${process.pid}`;

      const args: AccountCheckArgs = {
        client_id: serviceAccountConfigMock.clientId,
        redirect_uri: redirectUri,
        market,
        locale,
        test: true,
      };

      const link: string = `${config.tink.linkBaseUrl}/1.0/transactions/connect-account?${qs.stringify(args)}`;

      expect(tinkLinkService.getAuthorizeLink(args, true)).toEqual(link);
    });
  });
});
