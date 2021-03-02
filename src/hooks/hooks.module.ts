import { Module } from '@nestjs/common';
import { AlgoanModule } from '../algoan/algoan.module';
import { HooksController } from './controllers/hooks.controller';
import { HooksService } from './services/hooks.service';

/**
 * Hooks module
 */
@Module({
  imports: [AlgoanModule],
  controllers: [HooksController],
  providers: [HooksService],
})
export class HooksModule {}
