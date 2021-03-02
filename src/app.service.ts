import { Injectable } from '@nestjs/common';

/**
 * App service
 */
@Injectable()
export class AppService {
  /**
   * GET Hello
   */
  public getPing = (): string => 'ok';
}
