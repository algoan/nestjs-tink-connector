import { Module } from '@nestjs/common';
import { AlgoanService } from './algoan.service';

/**
 * Algoan module
 */
@Module({
  providers: [AlgoanService],
  exports: [AlgoanService],
})
export class AlgoanModule {}
