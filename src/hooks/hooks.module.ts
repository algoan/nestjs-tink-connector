import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { TinkModule } from '../tink/tink.module';
import { AlgoanModule } from '../algoan/algoan.module';
import { HooksController } from './controllers/hooks.controller';
import { HooksService } from './services/hooks.service';

/**
 * Hooks module
 */
@Module({
  imports: [
    AlgoanModule,
    ConfigModule,
    TinkModule,
  ],
  controllers: [
    HooksController,
  ],
  providers: [
    HooksService,
  ],
})
export class HooksModule {}
