/* eslint-disable @typescript-eslint/naming-convention,camelcase */
import {
  Algoan,
  IServiceAccount,
  ISubscriptionEvent,
  RequestBuilder,
  ServiceAccount,
  Subscription,
  SubscriptionEvent,
} from '@algoan/rest';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'node-config-ts';
import { ContextIdFactory } from '@nestjs/core';

import { analysisMock } from '../../algoan/dto/analysis.objects.mock';
import { AlgoanAnalysisService } from '../../algoan/services/algoan-analysis.service';
import { TinkAccountService } from '../../tink/services/tink-account.service';
import { TinkProviderService } from '../../tink/services/tink-provider.service';
import { TinkTransactionService } from '../../tink/services/tink-transaction.service';
import { tinkSearchResponseObjectMock } from '../../tink/dto/search.objects.mock';
import { tinkAccountObjectMock } from '../../tink/dto/account.objects.mock';
import { tinkProviderObjectMock } from '../../tink/dto/provider.objects.mock';
import { AnalysisUpdateInput } from '../../algoan/dto/analysis.inputs';
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
import { aggregatorLinkRequiredMock } from '../dto/aggregator-link-required-payload.dto.mock';
import { subscriptionMock } from '../dto/subscription.dto.mock';
import { TINK_LINK_ACTOR_CLIENT_ID } from '../../tink/contstants/tink.constants';

import { bankDetailsRequiredMock } from '../dto/bank-details-required-payload.dto.mock';
import { mapTinkDataToAlgoanAnalysis } from '../mappers/analysis.mapper';
import { HooksService } from './hooks.service';

describe('HookService', () => {
  let hookService: HooksService;
  let algoanService: AlgoanService;
  let algoanHttpService: AlgoanHttpService;
  let algoanCustomerService: AlgoanCustomerService;
  let algoanAnalysisService: AlgoanAnalysisService;
  let tinkLinkService: TinkLinkService;
  let tinkUserService: TinkUserService;
  let tinkAccountService: TinkAccountService;
  let tinkTransactionService: TinkTransactionService;
  let tinkProviderService: TinkProviderService;
  let tinkHttpService: TinkHttpService;
  let serviceAccount: ServiceAccount;

  beforeEach(async () => {
    // To mock scoped DI
    const contextId = ContextIdFactory.create();
    jest.spyOn(ContextIdFactory, 'getByRequest').mockImplementation(() => contextId);

    const serviceAccountValue: ServiceAccount = new ServiceAccount('mockBaseURL', {
      id: 'mockServiceAccountId',
      clientId: 'mockClientId',
      clientSecret: 'mockClientSecret',
      createdAt: 'mockCreatedAt',
      config: serviceAccountConfigMock,
    } as IServiceAccount);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AlgoanModule, TinkModule],
      providers: [
        HooksService,
        {
          provide: CONFIG,
          useValue: config,
        },
        {
          provide: ServiceAccount,
          useValue: serviceAccountValue,
        },
      ],
    }).compile();

    hookService = await moduleRef.resolve<HooksService>(HooksService, contextId);
    algoanService = await moduleRef.resolve<AlgoanService>(AlgoanService, contextId);
    algoanHttpService = await moduleRef.resolve<AlgoanHttpService>(AlgoanHttpService, contextId);
    algoanCustomerService = await moduleRef.resolve<AlgoanCustomerService>(AlgoanCustomerService, contextId);
    algoanAnalysisService = await moduleRef.resolve<AlgoanAnalysisService>(AlgoanAnalysisService, contextId);
    tinkLinkService = await moduleRef.resolve<TinkLinkService>(TinkLinkService, contextId);
    tinkUserService = await moduleRef.resolve<TinkUserService>(TinkUserService, contextId);
    tinkAccountService = await moduleRef.resolve<TinkAccountService>(TinkAccountService, contextId);
    tinkTransactionService = await moduleRef.resolve<TinkTransactionService>(TinkTransactionService, contextId);
    tinkProviderService = await moduleRef.resolve<TinkProviderService>(TinkProviderService, contextId);
    tinkHttpService = await moduleRef.resolve<TinkHttpService>(TinkHttpService, contextId);
    serviceAccount = await moduleRef.resolve<ServiceAccount>(ServiceAccount, contextId);

    jest.spyOn(Algoan.prototype, 'initRestHooks').mockResolvedValue();

    await algoanService.onModuleInit();

    jest
      .spyOn(SubscriptionEvent.prototype, 'update')
      .mockResolvedValue(({} as unknown) as ISubscriptionEvent & { id: string });
    jest.spyOn(algoanService.algoanClient, 'getServiceAccountBySubscriptionId').mockReturnValue(serviceAccount);

    serviceAccount.subscriptions = [
      new Subscription(subscriptionMock, new RequestBuilder('mockBaseURL', { clientId: 'mockClientId' })),
    ];
  });

  it('should be defined', () => {
    expect(hookService).toBeDefined();
  });

  describe('handleBankreaderLinkRequiredEvent', () => {
    let algoanAuthenticateSpy;
    let tinkAuthenticateAsClientWithCredentialsSpy;
    let updateCustomerSpy;
    let getLinkSpy;
    let getCustomerByIdSpy;
    let createNewUserSpy;
    let delegateAuthorizationToUserSpy;

    beforeEach(async () => {
      algoanAuthenticateSpy = jest.spyOn(algoanHttpService, 'authenticate').mockReturnValue();
      tinkAuthenticateAsClientWithCredentialsSpy = jest
        .spyOn(tinkHttpService, 'authenticateAsClientWithCredentials')
        .mockResolvedValue();
      updateCustomerSpy = jest.spyOn(algoanCustomerService, 'updateCustomer').mockResolvedValue(customerMock);
      getLinkSpy = jest.spyOn(tinkLinkService, 'getAuthorizeLink').mockReturnValue('MY_LINK_URL');
      getCustomerByIdSpy = jest.spyOn(algoanCustomerService, 'getCustomerById').mockResolvedValue(customerMock);
      createNewUserSpy = jest.spyOn(tinkUserService, 'createNewUser').mockResolvedValue(createUserObject);
      delegateAuthorizationToUserSpy = jest
        .spyOn(tinkUserService, 'delegateAuthorizationToUser')
        .mockResolvedValue(createAuthorizationObjectMock.code);
    });

    it('should throw error if customer callback url missing', async () => {
      // We return a customer without callback url
      updateCustomerSpy = jest.spyOn(algoanCustomerService, 'getCustomerById').mockResolvedValue({
        ...customerMock,
        aggregationDetails: {
          ...customerMock.aggregationDetails,
          callbackUrl: undefined,
        },
      });

      await expect(hookService.handleAggregatorLinkRequiredEvent(aggregatorLinkRequiredMock)).rejects.toThrowError(
        `Missing information: callbackUrl: undefined, clientConfig: ${JSON.stringify(serviceAccountConfigMock)}`,
      );
    });

    it('should throw error if client config missing', async () => {
      serviceAccount.config = undefined;
      await expect(hookService.handleAggregatorLinkRequiredEvent(aggregatorLinkRequiredMock)).rejects.toThrowError(
        `Missing information: callbackUrl: ${customerMock.aggregationDetails.callbackUrl}, clientConfig: undefined`,
      );
    });

    it('should do these steps if pricing STANDARD', async () => {
      serviceAccountConfigMock.pricing = ClientPricing.STANDARD;
      await hookService.handleAggregatorLinkRequiredEvent(aggregatorLinkRequiredMock);

      // get algoan customer
      expect(algoanAuthenticateSpy).toHaveBeenCalled();
      expect(getCustomerByIdSpy).toHaveBeenCalledWith(aggregatorLinkRequiredMock.customerId);

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
        scope: 'accounts:read,transactions:read,credentials:read',
        test: config.tink.test,
      });

      // update
      expect(updateCustomerSpy).toHaveBeenCalledWith(aggregatorLinkRequiredMock.customerId, {
        aggregationDetails: {
          redirectUrl: 'MY_LINK_URL',
        },
      });
    });

    it('should do these steps if pricing PREMIUM WITHOUT an existing tink user', async () => {
      serviceAccountConfigMock.pricing = ClientPricing.PREMIUM;
      await hookService.handleAggregatorLinkRequiredEvent(aggregatorLinkRequiredMock);

      // get algoan customer
      expect(algoanAuthenticateSpy).toHaveBeenCalled();
      expect(getCustomerByIdSpy).toHaveBeenCalledWith(aggregatorLinkRequiredMock.customerId);

      // premium
      expect(tinkAuthenticateAsClientWithCredentialsSpy).toHaveBeenCalledWith(
        serviceAccountConfigMock.clientId,
        serviceAccountConfigMock.clientSecret,
      );
      expect(createNewUserSpy).toHaveBeenCalledWith({
        external_user_id: aggregatorLinkRequiredMock.customerId,
        locale: serviceAccountConfigMock.locale,
        market: serviceAccountConfigMock.market,
      });
      expect(delegateAuthorizationToUserSpy).toHaveBeenCalledWith({
        user_id: createUserObject.user_id,
        scope: 'user:read,authorization:read,authorization:grant,credentials:read,credentials:write,providers:read',
        id_hint: customerMock.customIdentifier,
        actor_client_id: TINK_LINK_ACTOR_CLIENT_ID,
      });
      expect(getLinkSpy).toHaveBeenCalledWith({
        client_id: serviceAccountConfigMock.clientId,
        redirect_uri: customerMock.aggregationDetails.callbackUrl,
        market: serviceAccountConfigMock.market,
        locale: serviceAccountConfigMock.locale,
        scope: 'accounts:read,transactions:read,credentials:read',
        test: config.tink.test,
        authorization_code: createAuthorizationObjectMock.code,
      });

      // update
      expect(updateCustomerSpy).toHaveBeenCalledWith(aggregatorLinkRequiredMock.customerId, {
        aggregationDetails: {
          redirectUrl: 'MY_LINK_URL',
          userId: createUserObject.user_id,
        },
      });
    });

    it('should do these steps if pricing PREMIUM WITH an existing tink user', async () => {
      // mock to return an existing userId
      getCustomerByIdSpy = jest.spyOn(algoanCustomerService, 'getCustomerById').mockResolvedValue({
        ...customerMock,
        aggregationDetails: {
          ...customerMock.aggregationDetails,
          userId: createUserObject.user_id,
        },
      });

      serviceAccountConfigMock.pricing = ClientPricing.PREMIUM;
      await hookService.handleAggregatorLinkRequiredEvent(aggregatorLinkRequiredMock);

      // get algoan customer
      expect(algoanAuthenticateSpy).toHaveBeenCalled();
      expect(getCustomerByIdSpy).toHaveBeenCalledWith(aggregatorLinkRequiredMock.customerId);

      // premium
      expect(tinkAuthenticateAsClientWithCredentialsSpy).toHaveBeenCalled();
      expect(createNewUserSpy).not.toHaveBeenCalled();
      expect(delegateAuthorizationToUserSpy).toHaveBeenCalledWith({
        user_id: createUserObject.user_id,
        scope: 'user:read,authorization:read,authorization:grant,credentials:read,credentials:write,providers:read',
        id_hint: customerMock.customIdentifier,
        actor_client_id: TINK_LINK_ACTOR_CLIENT_ID,
      });
      expect(getLinkSpy).toHaveBeenCalledWith({
        client_id: serviceAccountConfigMock.clientId,
        redirect_uri: customerMock.aggregationDetails.callbackUrl,
        market: serviceAccountConfigMock.market,
        locale: serviceAccountConfigMock.locale,
        scope: 'accounts:read,transactions:read,credentials:read',
        test: config.tink.test,
        authorization_code: createAuthorizationObjectMock.code,
      });

      // update
      expect(updateCustomerSpy).toHaveBeenCalledWith(aggregatorLinkRequiredMock.customerId, {
        aggregationDetails: {
          redirectUrl: 'MY_LINK_URL',
          userId: createUserObject.user_id,
        },
      });
    });
  });

  describe('handleBankDetailsRequiredEvent', () => {
    // Force same current Date
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const toISOStringFn = Date.prototype.toISOString;
    const isoString = new Date().toISOString();

    let algoanAuthenticateSpy;
    let updateAnalysisSpy;
    let tinkAuthenticateAsUserWithCodesSpy;
    let getAccountsSpy;
    let getTransactionsSpy;
    let getProvidersSpy;

    beforeEach(async () => {
      Date.prototype.toISOString = () => isoString;
    });

    beforeEach(async () => {
      algoanAuthenticateSpy = jest.spyOn(algoanHttpService, 'authenticate').mockReturnValue();
      updateAnalysisSpy = jest.spyOn(algoanAnalysisService, 'updateAnalysis').mockResolvedValue(analysisMock);
      tinkAuthenticateAsUserWithCodesSpy = jest
        .spyOn(tinkHttpService, 'authenticateAsUserWithCode')
        .mockResolvedValue();
      getAccountsSpy = jest.spyOn(tinkAccountService, 'getAccounts').mockResolvedValue([tinkAccountObjectMock]);
      getTransactionsSpy = jest
        .spyOn(tinkTransactionService, 'getTransactions')
        .mockResolvedValue([tinkSearchResponseObjectMock.results[0].transaction]);
      getProvidersSpy = jest.spyOn(tinkProviderService, 'getProviders').mockResolvedValue([tinkProviderObjectMock]);
    });

    it('should do these steps', async () => {
      await hookService.handleBankDetailsRequiredEvent(bankDetailsRequiredMock);

      // Authenticate as user
      expect(tinkAuthenticateAsUserWithCodesSpy).toHaveBeenCalledWith(
        serviceAccountConfigMock.clientId,
        serviceAccountConfigMock.clientSecret,
        bankDetailsRequiredMock.temporaryCode,
      );

      // Get data from tink
      expect(getAccountsSpy).toHaveBeenCalled();
      expect(getTransactionsSpy).toHaveBeenCalled();
      expect(getProvidersSpy).toHaveBeenCalled();

      const analysisInputMock: AnalysisUpdateInput = mapTinkDataToAlgoanAnalysis(
        [tinkAccountObjectMock],
        [tinkSearchResponseObjectMock.results[0].transaction],
        [tinkProviderObjectMock],
      );

      // Authenticate to Algoan
      expect(algoanAuthenticateSpy).toHaveBeenCalled();

      // Update analysis
      expect(updateAnalysisSpy).toHaveBeenCalledWith(
        bankDetailsRequiredMock.customerId,
        bankDetailsRequiredMock.analysisId,
        analysisInputMock,
      );
    });

    it('should throw error if client config missing', async () => {
      serviceAccount.config = undefined;
      await expect(hookService.handleBankDetailsRequiredEvent(bankDetailsRequiredMock)).rejects.toThrowError(
        `Missing information: clientConfig: undefined`,
      );
    });

    afterEach(async () => {
      Date.prototype.toISOString = toISOStringFn;
    });
  });
});
