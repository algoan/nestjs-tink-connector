import { LoggingInterceptor } from '@algoan/nestjs-logging-interceptor';
import { HttpModule, HttpService, Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Config } from 'node-config-ts';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CONFIG, ConfigModule } from './config/config.module';
import { HooksModule } from './hooks/hooks.module';

/**
 * App module
 */
@Module({
  imports: [ConfigModule, HttpModule, HooksModule],
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
export class AppModule implements OnModuleInit {
  constructor(@Inject(CONFIG) private readonly config: Config, private readonly httpService: HttpService) {}

  /**
   * Log all httpService requests
   */
  public onModuleInit(): void {
    const logger: Logger = new Logger(HttpService.name);

    this.httpService.axiosRef.interceptors.request.use(
      (config: AxiosRequestConfig): AxiosRequestConfig => {
        if (this.config.enableHttpRequestLog) {
          logger.log({
            config,
            message: `${config.method} ${config.url}`,
          });
        }

        return config;
      },
    );
    this.httpService.axiosRef.interceptors.response.use(
      async (response: AxiosResponse) => {
        if (this.config.enableHttpRequestLog) {
          logger.log({
            message: `${response.config.method} ${response.config.url}`,
            headers: response.headers,
            body: response.data,
          });
        }

        return Promise.resolve(response);
      },
      async (error: AxiosError) => {
        if (this.config.enableHttpErrorLog) {
          logger.error(
            {
              headers: error.response?.headers,
              message: error.message,
              body: error.response?.data,
            },
            error.stack,
            error.message,
          );
        }

        return Promise.reject(error);
      },
    );
  }
}
