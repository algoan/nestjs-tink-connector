import { FactoryProvider, Scope, UnauthorizedException } from '@nestjs/common';
import { ServiceAccount } from '@algoan/rest';
import { Request } from 'express';

import { AlgoanService } from '../algoan/services/algoan.service';
import { EventDTO } from './dto/event.dto';

export const serviceAccoutProviders: FactoryProvider[] = [
  {
    provide: ServiceAccount,
    scope: Scope.REQUEST,
    useFactory: (
      request: Request<unknown, unknown, EventDTO | undefined>,
      algoanService: AlgoanService,
    ): ServiceAccount | undefined => {
      const subScriptionId: string | undefined = request.body?.subscription?.id;
      if (subScriptionId === undefined) {
        return undefined;
      }

      const serviceAccount: ServiceAccount | undefined = algoanService.algoanClient.getServiceAccountBySubscriptionId(
        subScriptionId,
      );

      if (serviceAccount === undefined) {
        throw new UnauthorizedException(`No service account found for subscription ${subScriptionId}`);
      }

      return serviceAccount;
    },
    inject: ['REQUEST', AlgoanService],
  },
];
