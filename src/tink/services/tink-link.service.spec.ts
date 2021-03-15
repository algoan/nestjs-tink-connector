/* eslint-disable @typescript-eslint/naming-convention, camelcase */
import * as qs from 'qs';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'node-config-ts';

import { CONFIG } from '../../config/config.module';

import { AccountCheckArgs } from '../dto/account-check.args';

import { TinkLinkService } from './tink-link.service';

describe('TinkLinkService', () => {
  let tinkLinkService: TinkLinkService;

  describe('getLink', () => {
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

    it('should return a link WITH the authorizationCode', async () => {
      const redirectUri: string = `http://callBackUrl/redirect-${process.pid}`;
      const market: string = `FR-${process.pid}`;
      const locale: string = `fr_FR-${process.pid}`;
      const scope: string = `scope-${process.pid}`;
      const authorizationCode: string = `authorizationCode-${process.pid}`;

      const args: AccountCheckArgs = {
        client_id: config.tink.clientId,
        redirect_uri: redirectUri,
        market,
        locale,
        scope,
        test: true,
        authorization_code: authorizationCode,
      };

      const link: string = `${config.tink.linkBaseUrl}/1.0/account-check/?${qs.stringify(args)}`;

      expect(tinkLinkService.getLink(args)).toEqual(link);
    });

    it('should return a link WITHOUT authorizationCode', async () => {
      const redirectUri: string = `http://callBackUrl/redirect-${process.pid}`;
      const market: string = `FR-${process.pid}`;
      const locale: string = `fr_FR-${process.pid}`;
      const scope: string = `scope-${process.pid}`;

      const args: AccountCheckArgs = {
        client_id: config.tink.clientId,
        redirect_uri: redirectUri,
        market,
        locale,
        scope,
        test: true,
      };

      const link: string = `${config.tink.linkBaseUrl}/1.0/account-check/?${qs.stringify(args)}`;

      expect(tinkLinkService.getLink(args)).toEqual(link);
    });
  });
});