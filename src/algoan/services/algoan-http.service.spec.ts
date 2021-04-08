import { RequestBuilder } from '@algoan/rest';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from 'node-config-ts';
import { CONFIG } from '../../config/config.module';
import { Customer } from '../dto/customer.objects';

import { customerMock } from '../dto/customer.objects.mock';

import { AlgoanHttpService } from './algoan-http.service';

describe('AlgoanHttpService', () => {
  let algoanHttpService: AlgoanHttpService;
  let spyRequest;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AlgoanHttpService,
        {
          provide: CONFIG,
          useValue: config,
        },
      ],
    }).compile();

    algoanHttpService = await moduleRef.resolve<AlgoanHttpService>(AlgoanHttpService);

    spyRequest = jest.spyOn(RequestBuilder.prototype, 'request').mockReturnValue(Promise.resolve(customerMock));
  });

  it('should be defined', () => {
    expect(algoanHttpService).toBeDefined();
  });

  describe('get', () => {
    it('should send a get request if authenticated', async () => {
      // authenticate
      algoanHttpService.authenticate('clientId', 'clientSecret');

      // get
      const result: string = await algoanHttpService.get('my/path');

      expect(spyRequest).toHaveBeenCalledWith({ method: 'GET', url: 'my/path' });
      expect(result).toBe(customerMock);
    });

    it('should throw an error if NOT authenticated', async () => {
      await expect(algoanHttpService.get('my/path')).rejects.toThrowError();
    });
  });

  describe('post', () => {
    it('should send a post request if authenticated', async () => {
      // authenticate
      algoanHttpService.authenticate('clientId', 'clientSecret');

      // post
      const input = { myField: 'myField' };
      const result: string = await algoanHttpService.post('my/path', input);

      expect(spyRequest).toHaveBeenCalledWith({ method: 'POST', url: 'my/path', data: input });
      expect(result).toBe(customerMock);
    });

    it('should throw an error if NOT authenticated', async () => {
      const input = { myField: 'myField' };
      await expect(algoanHttpService.post('my/path', input)).rejects.toThrowError();
    });
  });

  describe('patch', () => {
    it('should send a patch request if authenticated', async () => {
      // authenticate
      algoanHttpService.authenticate('clientId', 'clientSecret');

      // patch
      const input = { myField: 'myField' };
      const result: string = await algoanHttpService.patch('my/path', input);

      expect(spyRequest).toHaveBeenCalledWith({ method: 'PATCH', url: 'my/path', data: input });
      expect(result).toBe(customerMock);
    });

    it('should throw an error if NOT authenticated', async () => {
      const input = { myField: 'myField' };
      await expect(algoanHttpService.patch('my/path', input)).rejects.toThrowError();
    });
  });

  describe('request', () => {
    it('should request', async () => {
      // authenticate
      algoanHttpService.authenticate('clientId', 'clientSecret');

      // patch
      const input = { myField: 'myField' };
      const result: Customer = await algoanHttpService.request({ method: 'PATCH', url: 'my/path', data: input });

      expect(spyRequest).toHaveBeenCalledWith({ method: 'PATCH', url: 'my/path', data: input });
      expect(result).toBe(customerMock);
    });

    it('should throw an error if NOT authenticated', async () => {
      const input = { myField: 'myField' };
      await expect(algoanHttpService.request({ method: 'PATCH', url: 'my/path', data: input })).rejects.toThrowError();
    });
  });
});
