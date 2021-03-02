import { Test, TestingModule } from '@nestjs/testing';
import { Algoan } from '@algoan/rest';
import { config } from 'node-config-ts';

import { AlgoanService } from './algoan.service';

describe('AlgoanService', () => {
  let service: AlgoanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlgoanService],
    }).compile();

    service = module.get<AlgoanService>(AlgoanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should start properly', async () => {
    jest.spyOn(Algoan.prototype, 'initRestHooks').mockReturnValue(Promise.resolve());
    await expect(service.onModuleInit()).resolves.toEqual(undefined);
  });

  it('should throw an error', async () => {
    config.eventList = [];

    await expect(service.onModuleInit()).rejects.toThrow('No event list given');
  });
});
