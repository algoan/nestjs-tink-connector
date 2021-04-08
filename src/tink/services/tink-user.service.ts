import { Injectable } from '@nestjs/common';
import { CreateAuthorizationObject } from '../dto/create-authorization.object';
import { CreateDelegatedAuthorizationInput } from '../dto/create-delegated-authorization.input';

import { CreateUserInput } from '../dto/create-user.input';
import { CreateUserObject } from '../dto/create-user.object';

import { TinkHttpService } from './tink-http.service';

/**
 * Service to manage user
 */
@Injectable()
export class TinkUserService {
  constructor(private readonly tinkHttpService: TinkHttpService) {}

  /**
   * Create a new user
   */
  public async createNewUser(input: CreateUserInput): Promise<CreateUserObject> {
    return this.tinkHttpService.post<CreateUserObject, CreateUserInput>('/api/v1/user/create', input);
  }

  /**
   * Grant a user with the given scopes
   */
  public async delegateAuthorizationToUser(input: CreateDelegatedAuthorizationInput): Promise<string> {
    const authorization: CreateAuthorizationObject = await this.tinkHttpService.post<
      CreateAuthorizationObject,
      CreateDelegatedAuthorizationInput
    >('/api/v1/oauth/authorization-grant/delegate', input, true);

    return authorization.code;
  }
}
