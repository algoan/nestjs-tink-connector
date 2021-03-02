import { HttpExceptionFilter } from '@algoan/nestjs-http-exception-filter';
import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';

import { AppModule } from './app.module';

const logger: Logger = new Logger(__filename);

/**
 * Bootstrap method
 */
const bootstrap = async (): Promise<void> => {
  const port: number = 3000;
  const defaultLevel: string = process.env.DEBUG_LEVEL ?? 'info';
  const nodeEnv: string | undefined = process.env.NODE_ENV;

  const app: INestApplication = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      format:
        nodeEnv === 'production'
          ? format.json()
          : format.combine(
              format.colorize({
                colors: {
                  debug: 'blue',
                  error: 'red',
                  info: 'green',
                  warn: 'yellow',
                },
              }),
              format.simple(),
              format.errors({ stack: true }),
            ),
      level: defaultLevel,
      transports: [
        new transports.Console({
          level: defaultLevel,
          stderrLevels: ['error'],
          consoleWarnLevels: ['warning'],
          silent: nodeEnv === 'test',
        }),
      ],
    }),
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
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
  logger.log(`Application is listening to port ${port}`);
};
bootstrap().catch((err: Error): void => {
  // eslint-disable-next-line
  logger.error(err, `An error occurred when bootstrapping the application`);
  process.exit(1);
});
