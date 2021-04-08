/* eslint-disable @typescript-eslint/naming-convention */
import { Module } from '@nestjs/common';
import { config } from 'node-config-ts';

export const CONFIG: string = 'CONFIG';

/**
 * Config module
 */
@Module({
  providers: [
    {
      provide: CONFIG,
      useValue: config,
    },
  ],
  exports: [CONFIG],
})
export class ConfigModule {}
