import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';

import { TinkHttpService } from './services/tink-http.service';
import { TinkLinkService } from './services/tink-link.service';
import { TinkUserService } from './services/tink-user.service';
import { TinkAccountService } from './services/tink-account.service';
import { TinkProviderService } from './services/tink-provider.service';
import { TinkTransactionService } from './services/tink-transaction.service';
import { TinkCategoryService } from './services/tink-category.service';

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
    TinkCategoryService,
  ],
  exports: [
    TinkAccountService,
    TinkHttpService,
    TinkLinkService,
    TinkUserService,
    TinkProviderService,
    TinkTransactionService,
    TinkCategoryService,
  ],
})
export class TinkModule {}
