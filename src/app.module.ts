import { LoggingInterceptor } from '@algoan/nestjs-logging-interceptor';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlgoanModule } from './algoan/algoan.module';
import { HooksModule } from './hooks/hooks.module';

/**
 * App module
 */
@Module({
  imports: [AlgoanModule, HooksModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => {
        const interceptor: LoggingInterceptor = new LoggingInterceptor();
        interceptor.setUserPrefix('C-BI');

        return interceptor;
      },
    },
  ],
})
export class AppModule {}
