// account.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AccountClientService {
  constructor(
    @Inject('ACCOUNT_SERVICE') private readonly client: ClientProxy,
  ) {}

  async getUserInfo(accountId: number) {
    return await firstValueFrom(
      this.client.send({ cmd: 'account.get-user-info' }, { accountId }),
    );
  }
}
