import * as nock from 'nock';
import { HttpStatus } from '@nestjs/common';

/**
 * Return a nock scope instance
 * @param baseUrl
 * @param method
 * @param result
 * @param path
 */
export const fakeAPI = (params: FakeApiOptions): nock.Scope => {
  return nock(params.baseUrl)
    [params.method](params.path)
    .times(params.nbOfCalls ?? 1)
    .reply(HttpStatus.OK, params.result);
};

interface FakeApiOptions {
  baseUrl: string;
  method: 'get' | 'post' | 'patch';
  result: any;
  path: string;
  nbOfCalls?: number;
}
