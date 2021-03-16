import { HttpModule, Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';

import { TinkHttpService } from './services/tink-http.service';
import { TinkLinkService } from './services/tink-link.service';
import { TinkUserService } from './services/tink-user.service';
import { TinkAccountService } from './services/tink-account.service';

/**
 * Hooks module
 */
@Module({
  imports: [
    ConfigModule,
    HttpModule,
  ],
  providers: [
    TinkAccountService,
    TinkHttpService,
    TinkLinkService,
    TinkUserService,
  ],
  exports: [
    TinkAccountService,
    TinkHttpService,
    TinkLinkService,
    TinkUserService,
  ]
})
export class TinkModule {}
