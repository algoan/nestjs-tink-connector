/* eslint-disable @typescript-eslint/naming-convention, camelcase */
import { HttpModule } from '@nestjs/common';
import { ContextIdFactory } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'node-config-ts';

import { CONFIG } from '../../config/config.module';
import { createAuthorizationObjectMock } from '../dto/create-authorization.object.mock';

import { CreateDelegatedAuthorizationInput } from '../dto/create-delegated-authorization.input';
import { CreateUserInput } from '../dto/create-user.input';
import { CreateUserObject } from '../dto/create-user.object';
import { createUserObject } from '../dto/create-user.object.mock';

import { TinkHttpService } from './tink-http.service';
import { TinkUserService } from './tink-user.service';

describe('TinkUserService', () => {
  let tinkUserService: TinkUserService;
  let tinkHttpService: TinkHttpService;

  beforeEach(async () => {
    // To mock scoped DI
    const contextId = ContextIdFactory.create();
    jest.spyOn(ContextIdFactory, 'getByRequest').mockImplementation(() => contextId);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        TinkHttpService,
        TinkUserService,
        {
          provide: CONFIG,
          useValue: config,
        },
      ],
    }).compile();

    tinkUserService = await moduleRef.resolve<TinkUserService>(TinkUserService, contextId);
    tinkHttpService = await moduleRef.resolve<TinkHttpService>(TinkHttpService, contextId);
  });

  it('should be defined', () => {
    expect(tinkUserService).toBeDefined();
  });

  describe('createNewUser', () => {
    it('should create a new user', async () => {
      const spy = jest.spyOn(tinkHttpService, 'post').mockReturnValue(Promise.resolve(createUserObject));
      const input: CreateUserInput = {
        external_user_id: 'external_user_id',
        locale: 'locale',
        market: 'market',
      };
      const user: CreateUserObject = await tinkUserService.createNewUser(input);

      expect(spy).toHaveBeenCalledWith(`/api/v1/user/create`, input);
      expect(user).toBe(createUserObject);
    });
  });

  describe('delegateAuthorizationToUser', () => {
    it('should create a delegate authorization', async () => {
      const spy = jest.spyOn(tinkHttpService, 'post').mockReturnValue(Promise.resolve(createAuthorizationObjectMock));

      const input: CreateDelegatedAuthorizationInput = {
        user_id: 'user_id',
        id_hint: 'id_hint',
        actor_client_id: 'actor_client_id',
        scope: 'scope',
      };
      const code: string = await tinkUserService.delegateAuthorizationToUser(input);

      expect(spy).toHaveBeenCalledWith(`/api/v1/oauth/authorization-grant/delegate`, input, true);
      expect(code).toBe(createAuthorizationObjectMock.code);
    });
  });
});
