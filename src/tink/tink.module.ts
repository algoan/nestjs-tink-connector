import { HttpModule, Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';

import { TinkHttpService } from './services/tink-http.service';
import { TinkLinkService } from './services/tink-link.service';
import { TinkUserService } from './services/tink-user.service';
import { TinkAccountService } from './services/tink-account.service';
import { TinkProviderService } from './services/tink-provider.service';
import { TinkTransactionService } from './services/tink-transaction.service';

/**
 * Hooks module
 */
@Module({
  imports: [ConfigModule, HttpModule],
  providers: [
    TinkAccountService,
    TinkHttpService,
    TinkLinkService,
    TinkUserService,
    TinkProviderService,
    TinkTransactionService,
  ],
  exports: [
    TinkAccountService,
    TinkHttpService,
    TinkLinkService,
    TinkUserService,
    TinkProviderService,
    TinkTransactionService,
  ],
})
export class TinkModule {}
