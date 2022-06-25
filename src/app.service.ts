import { Injectable } from '@nestjs/common';

/**
 * App service
 */
@Injectable()
export class AppService {
  /**
   * GET Hello
   */
  // eslint-disable-next-line class-methods-use-this
  public getPing = (): string => 'ok';
}
