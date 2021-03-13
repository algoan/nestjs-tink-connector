/* eslint-disable @typescript-eslint/naming-convention, camelcase */
import * as qs from 'qs';
import { Inject, Injectable, Scope } from "@nestjs/common";
import { Config } from "node-config-ts";

import { CONFIG } from "../../config/config.module";

import { AccountCheckArgs } from '../dto/account-check.args';

/**
 * Service to manage link
 */
@Injectable()
export class TinkLinkService {
  constructor(
    @Inject(CONFIG) private readonly config: Config,
  ) {}

  /**
   * Get a link for a standard pricing
   */
  // eslint-disable-next-line class-methods-use-this
  public getLink(args: AccountCheckArgs): string {
    return `${this.config.tink.linkBaseUrl}/1.0/account-check/?${qs.stringify(args)}`;
  }
}
