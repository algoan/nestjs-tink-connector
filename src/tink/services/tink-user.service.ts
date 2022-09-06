import { Injectable } from '@nestjs/common';
import { CreateAuthorizationCode } from '../dto/authorization-grant.obect';
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

  /**
   * Create an authorization code for a user
   */
  public async postAuthorizationGrant(input: CreateAuthorizationCode): Promise<string> {
    const authorization: CreateAuthorizationObject = await this.tinkHttpService.post<
      CreateAuthorizationObject,
      CreateAuthorizationCode
    >('/api/v1/oauth/authorization-grant', input, true);

    return authorization.code;
  }
}
