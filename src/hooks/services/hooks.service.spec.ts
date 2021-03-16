/* eslint-disable @typescript-eslint/naming-convention,camelcase */
import { Algoan, IServiceAccount, ISubscriptionEvent, RequestBuilder, ServiceAccount, Subscription, SubscriptionEvent } from '@algoan/rest';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'node-config-ts';
import { ContextIdFactory } from '@nestjs/core';

import { serviceAccountConfigMock } from '../../algoan/dto/service-account.objects.mock';
import { createAuthorizationObjectMock } from '../../tink/dto/create-authorization.object.mock';
import { AlgoanModule } from '../../algoan/algoan.module';
import { TinkModule } from '../../tink/tink.module';
import { customerMock } from '../../algoan/dto/customer.objects.mock';
import { ClientPricing } from '../../algoan/dto/service-account.enums';
import { AlgoanCustomerService } from '../../algoan/services/algoan-customer.service';
import { AlgoanHttpService } from '../../algoan/services/algoan-http.service';
import { CONFIG } from '../../config/config.module';
import { createUserObject } from '../../tink/dto/create-user.object.mock';
import { TinkHttpService } from '../../tink/services/tink-http.service';
import { TinkLinkService } from '../../tink/services/tink-link.service';
import { TinkUserService } from '../../tink/services/tink-user.service';
import { AlgoanService } from '../../algoan/services/algoan.service';
import { payloadMock } from '../dto/payload.dto.mock';
import { subscriptionMock } from '../dto/subscription.dto.mock';
import { TINK_LINK_ACTOR_CLIENT_ID } from '../../tink/contstants/tink.constants';

import { HooksService } from './hooks.service';

describe('TinkAccountService', () => {
  let hookService: HooksService;
  let algoanService: AlgoanService;
  let algoanHttpService: AlgoanHttpService;
  let algoanCustomerService: AlgoanCustomerService;
  let tinkLinkService: TinkLinkService;
  let tinkUserService: TinkUserService;
  let tinkHttpService: TinkHttpService;
  let serviceAccountMock: ServiceAccount;

  beforeEach(async () => {
    // To mock scoped DI
    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        AlgoanModule,
        TinkModule,
      ],
      providers: [
        HooksService,
        {
          provide: CONFIG,
          useValue: config,
        },
      ],
    }).compile();

    hookService = await moduleRef.resolve<HooksService>(HooksService, contextId);
    algoanService = await moduleRef.resolve<AlgoanService>(AlgoanService, contextId);
    algoanHttpService = await moduleRef.resolve<AlgoanHttpService>(AlgoanHttpService, contextId);
    algoanCustomerService = await moduleRef.resolve<AlgoanCustomerService>(AlgoanCustomerService, contextId);
    tinkLinkService = await moduleRef.resolve<TinkLinkService>(TinkLinkService, contextId);
    tinkUserService = await moduleRef.resolve<TinkUserService>(TinkUserService, contextId);
    tinkHttpService = await moduleRef.resolve<TinkHttpService>(TinkHttpService, contextId);

    jest.spyOn(Algoan.prototype, 'initRestHooks').mockResolvedValue();

    await algoanService.onModuleInit();

    jest
      .spyOn(SubscriptionEvent.prototype, 'update')
      .mockResolvedValue(({} as unknown) as ISubscriptionEvent & { id: string });
    jest.spyOn(algoanService.algoanClient, 'getServiceAccountBySubscriptionId').mockReturnValue(serviceAccountMock);

    serviceAccountMock = new ServiceAccount(
      'mockBaseURL',
      {
        id: 'mockServiceAccountId',
        clientId: 'mockClientId',
        clientSecret: 'mockClientSecret',
        createdAt: 'mockCreatedAt',
        config: serviceAccountConfigMock,
      } as IServiceAccount,
    );

    serviceAccountMock.subscriptions = [
      new Subscription(
        subscriptionMock,
        new RequestBuilder('mockBaseURL', { clientId: 'mockClientId' }),
      ),
    ];
  });

  it('should be defined', () => {
    expect(hookService).toBeDefined();
  });

  describe('handleBankreaderLinkRequiredEvent', () => {
    let algoanAuthenticateSpy
    let tinkAuthenticateAsClientWithCredentialsSpy
    let tinkAuthenticateAsUserWithCodesSpy
    let updateCustomerSpy
    let getLinkSpy
    let getCustomerByIdSpy
    let createNewUserSpy
    let delegateAuthorizationToUserSpy

    beforeEach(async () => {
      algoanAuthenticateSpy = jest.spyOn(algoanHttpService, 'authenticate').mockReturnValue();
      tinkAuthenticateAsClientWithCredentialsSpy = jest
        .spyOn(tinkHttpService, 'authenticateAsClientWithCredentials')
        .mockResolvedValue();
      tinkAuthenticateAsUserWithCodesSpy = jest
        .spyOn(tinkHttpService, 'authenticateAsUserWithCode')
        .mockResolvedValue();
      updateCustomerSpy = jest.spyOn(algoanCustomerService, 'updateCustomer').mockResolvedValue(customerMock);
      getLinkSpy = jest.spyOn(tinkLinkService, 'getLink').mockReturnValue('MY_LINK_URL');
      getCustomerByIdSpy = jest.spyOn(algoanCustomerService, 'getCustomerById').mockResolvedValue(customerMock);
      createNewUserSpy = jest.spyOn(tinkUserService, 'createNewUser').mockResolvedValue(createUserObject);
      delegateAuthorizationToUserSpy = jest
        .spyOn(tinkUserService, 'delegateAuthorizationToUser')
        .mockResolvedValue(createAuthorizationObjectMock.code);
    });

    it('should throw error if customer callback url missing', async () => {
      // We return a customer without callback url
      updateCustomerSpy = jest
        .spyOn(algoanCustomerService, 'getCustomerById')
        .mockResolvedValue({
          ...customerMock,
          aggregationDetails: {
            ...customerMock.aggregationDetails,
            callbackUrl: undefined,
          }
        });

      await expect(hookService.handleAggregatorLinkRequiredEvent(serviceAccountMock, payloadMock))
        .rejects
        .toThrowError(`Missing information: callbackUrl: undefined, clientConfig: ${JSON.stringify(serviceAccountConfigMock)}`);
    });

    it('should throw error if client config missing', async () => {
      serviceAccountMock.config = undefined;
      await expect(hookService.handleAggregatorLinkRequiredEvent(serviceAccountMock, payloadMock))
        .rejects
        .toThrowError(`Missing information: callbackUrl: ${customerMock.aggregationDetails.callbackUrl}, clientConfig: undefined`);
    });

    it('should do these steps if pricing STANDARD', async () => {
      serviceAccountConfigMock.pricing = ClientPricing.STANDARD;
      await hookService.handleAggregatorLinkRequiredEvent(serviceAccountMock, payloadMock);

      // get algoan customer
      expect(algoanAuthenticateSpy).toHaveBeenCalled();
      expect(getCustomerByIdSpy).toHaveBeenCalledWith(payloadMock.customerId);

      // premium
      expect(tinkAuthenticateAsClientWithCredentialsSpy).not.toHaveBeenCalled();
      expect(createNewUserSpy).not.toHaveBeenCalled();
      expect(delegateAuthorizationToUserSpy).not.toHaveBeenCalled();

      // standard
      expect(getLinkSpy).toHaveBeenCalledWith({
        client_id: serviceAccountConfigMock.clientId,
        redirect_uri: customerMock.aggregationDetails.callbackUrl,
        market: serviceAccountConfigMock.market,
        locale: serviceAccountConfigMock.locale,
        scope: 'accounts:read,transactions:read',
        test: config.tink.test,
      });

      // update
      expect(updateCustomerSpy).toHaveBeenCalledWith(
        payloadMock.customerId,
        {
          aggregationDetails: {
            redirectUrl: 'MY_LINK_URL',
          }
        });
    });

    it('should do these steps if pricing PREMIUM WITHOUT an existing tink user', async () => {
      serviceAccountConfigMock.pricing = ClientPricing.PREMIUM;
      await hookService.handleAggregatorLinkRequiredEvent(serviceAccountMock, payloadMock);

      // get algoan customer
      expect(algoanAuthenticateSpy).toHaveBeenCalled();
      expect(getCustomerByIdSpy).toHaveBeenCalledWith(payloadMock.customerId);

      // premium
      expect(tinkAuthenticateAsClientWithCredentialsSpy).toHaveBeenCalledWith(
        serviceAccountConfigMock.clientId,
        serviceAccountConfigMock.clientSecret,
      )
      expect(createNewUserSpy).toHaveBeenCalledWith({
        external_user_id: payloadMock.customerId,
        locale: serviceAccountConfigMock.locale,
        market: serviceAccountConfigMock.market,
      });
      expect(delegateAuthorizationToUserSpy).toHaveBeenCalledWith({
        user_id: createUserObject.user_id,
        scope: 'credentials:read,credentials:refresh,credentials:write,providers:read,user:read,authorization:read',
        id_hint: customerMock.customIdentifier,
        actor_client_id: TINK_LINK_ACTOR_CLIENT_ID,
      });
      expect(getLinkSpy).toHaveBeenCalledWith({
        client_id: serviceAccountConfigMock.clientId,
        redirect_uri: customerMock.aggregationDetails.callbackUrl,
        market: serviceAccountConfigMock.market,
        locale: serviceAccountConfigMock.locale,
        scope: 'accounts:read,transactions:read,identity:read',
        test: config.tink.test,
        authorization_code: createAuthorizationObjectMock.code,
      });

      // update
      expect(updateCustomerSpy).toHaveBeenCalledWith(
        payloadMock.customerId,
        {
          aggregationDetails: {
            redirectUrl: 'MY_LINK_URL',
            userId: createUserObject.user_id,
          }
        });
    });

    it('should do these steps if pricing PREMIUM WITH an existing tink user', async () => {
      // mock to return an existing userId
      getCustomerByIdSpy = jest
        .spyOn(algoanCustomerService, 'getCustomerById')
        .mockResolvedValue({
          ...customerMock,
          aggregationDetails: {
            ...customerMock.aggregationDetails,
            userId: createUserObject.user_id,
          }
        });

      serviceAccountConfigMock.pricing = ClientPricing.PREMIUM;
      await hookService.handleAggregatorLinkRequiredEvent(serviceAccountMock, payloadMock);

      // get algoan customer
      expect(algoanAuthenticateSpy).toHaveBeenCalled();
      expect(getCustomerByIdSpy).toHaveBeenCalledWith(payloadMock.customerId);

      // premium
      expect(tinkAuthenticateAsClientWithCredentialsSpy).toHaveBeenCalled();
      expect(createNewUserSpy).not.toHaveBeenCalledWith({
        external_user_id: payloadMock.customerId,
        locale: serviceAccountConfigMock.locale,
        market: serviceAccountConfigMock.market,
      });
      expect(delegateAuthorizationToUserSpy).toHaveBeenCalledWith({
        user_id: createUserObject.user_id,
        scope: 'credentials:read,credentials:refresh,credentials:write,providers:read,user:read,authorization:read',
        id_hint: customerMock.customIdentifier,
        actor_client_id: TINK_LINK_ACTOR_CLIENT_ID,
      });
      expect(getLinkSpy).toHaveBeenCalledWith({
        client_id: serviceAccountConfigMock.clientId,
        redirect_uri: customerMock.aggregationDetails.callbackUrl,
        market: serviceAccountConfigMock.market,
        locale: serviceAccountConfigMock.locale,
        scope: 'accounts:read,transactions:read,identity:read',
        test: config.tink.test,
        authorization_code: createAuthorizationObjectMock.code,
      });

      // update
      expect(updateCustomerSpy).toHaveBeenCalledWith(
        payloadMock.customerId,
        {
          aggregationDetails: {
            redirectUrl: 'MY_LINK_URL',
            userId: createUserObject.user_id,
          }
        });
    });
  });
});
