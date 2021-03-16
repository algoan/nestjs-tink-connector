import { Test, TestingModule } from '@nestjs/testing';
import { Algoan } from '@algoan/rest';
import { config } from 'node-config-ts';

import { CONFIG } from '../../config/config.module';

import { AlgoanService } from './algoan.service';

describe('AlgoanService', () => {
  let algoanService: AlgoanService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AlgoanService,
        {
          provide: CONFIG,
          useValue: config,
        },
      ],
    }).compile();

    algoanService = moduleRef.get<AlgoanService>(AlgoanService);
  });

  it('should be defined', () => {
    expect(algoanService).toBeDefined();
  });

  it('should start properly', async () => {
    jest.spyOn(Algoan.prototype, 'initRestHooks').mockReturnValue(Promise.resolve());
    await expect(algoanService.onModuleInit()).resolves.toEqual(undefined);
  });

  it('should throw an error', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AlgoanService,
        {
          provide: CONFIG,
          useValue: {
            ...config,
            eventList: [],
          },
        },
      ],
    }).compile();

    algoanService = moduleRef.get<AlgoanService>(AlgoanService);

    await expect(algoanService.onModuleInit()).rejects.toThrow('No event list given');
  });
});
