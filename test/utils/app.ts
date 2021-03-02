import * as assert from 'assert';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import * as nock from 'nock';
import { config } from 'node-config-ts';

import { AppModule } from '../../src/app.module';
import { fakeAPI } from './fake-server';

export const fakeAlgoanBaseUrl: string = config.algoan.baseUrl;

/**
 * Build a fake nest application
 */
export const buildFakeApp = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();

  /**
   * Create fake servers to init resthooks
   */
  const fakeOAuthServer: nock.Scope = fakeAPI({
    baseUrl: fakeAlgoanBaseUrl,
    method: 'post',
    result: {
      access_token: 'token',
      refresh_token: 'refresh_token',
      expires_in: 3000,
      refresh_expires_in: 10000,
    },
    path: '/v2/oauth/token',
    nbOfCalls: 2,
  });
  const fakeServiceAccounts: nock.Scope = fakeAPI({
    baseUrl: fakeAlgoanBaseUrl,
    method: 'get',
    result: [
      {
        clientId: 'client1',
        clientSecret: 'secret',
        id: 'id1',
      },
    ],
    path: '/v1/service-accounts',
  });
  const fakeGetSubscriptions: nock.Scope = fakeAPI({
    baseUrl: fakeAlgoanBaseUrl,
    method: 'get',
    result: [],
    path: `/v1/subscriptions?filter=${JSON.stringify({
      eventName: { $in: config.eventList },
    })}`,
  });
  const fakePostSubscriptions: nock.Scope = fakeAPI({
    baseUrl: fakeAlgoanBaseUrl,
    method: 'post',
    result: { id: '1', eventName: 'bankreader_link_required', target: 'http://...' },
    path: '/v1/subscriptions',
  });

  /**
   * Attach global dependencies
   */
  app.useGlobalPipes(
    new ValidationPipe({
      /**
       * If set to true, validator will strip validated (returned)
       * object of any properties that do not use any validation decorators.
       */
      whitelist: true,
    }),
  );

  await app.init();

  assert.equal(fakeOAuthServer.isDone(), true);
  assert.equal(fakeServiceAccounts.isDone(), true);
  assert.equal(fakeGetSubscriptions.isDone(), true);
  assert.equal(fakePostSubscriptions.isDone(), true);

  return app;
};
