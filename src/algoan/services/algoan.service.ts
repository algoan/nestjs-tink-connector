import { Algoan, EventName } from '@algoan/rest';
import { Injectable, OnModuleInit, InternalServerErrorException, Inject } from '@nestjs/common';
import { utilities } from 'nest-winston';
import { Config } from 'node-config-ts';
import { format, transports } from 'winston';

import { CONFIG } from '../../config/config.module';

/**
 * Algoan service
 * Stores all methods related to Algoan
 */
@Injectable()
export class AlgoanService implements OnModuleInit {
  /**
   * Algoan client
   */
  public algoanClient!: Algoan;

  constructor(@Inject(CONFIG) private readonly config: Config) {}

  /**
   * Fetch services and creates subscription
   */
  public async onModuleInit(): Promise<void> {
    const defaultLevel: string = process.env.DEBUG_LEVEL ?? 'info';
    const nodeEnv: string | undefined = process.env.NODE_ENV;

    /**
     * Retrieve service accounts and get/create subscriptions
     */
    this.algoanClient = new Algoan({
      baseUrl: this.config.algoan.baseUrl,
      clientId: this.config.algoan.clientId,
      clientSecret: this.config.algoan.clientSecret,
      version: 1,
      loggerOptions: {
        format:
          nodeEnv === 'production' ? format.json() : format.combine(format.timestamp(), utilities.format.nestLike()),
        level: defaultLevel,
        transports: [
          new transports.Console({
            level: defaultLevel,
            stderrLevels: ['error'],
            consoleWarnLevels: ['warning'],
            silent: nodeEnv === 'test',
          }),
        ],
      },
    });

    if (this.config.eventList?.length <= 0) {
      throw new InternalServerErrorException('No event list given');
    }

    await this.algoanClient.initRestHooks(
      this.config.targetUrl,
      this.config.eventList as EventName[],
      this.config.restHooksSecret,
    );
  }
}
