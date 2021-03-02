import { Body, Controller, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { EventDTO } from '../dto/event.dto';
import { HooksService } from '../services/hooks.service';
/**
 * Headers interface
 */
interface IHeaders {
  'x-hub-signature': string;
}

/**
 * Hooks controller
 */
@Controller()
export class HooksController {
  constructor(private readonly hooksService: HooksService) {}

  /**
   * Hooks route
   */
  @Post('/hooks')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async controlHook(@Body() event: EventDTO, @Headers() headers: IHeaders): Promise<void> {
    return this.hooksService.handleWebhook(event, headers['x-hub-signature']);
  }
}
