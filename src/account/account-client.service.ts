// account.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AccountResDto } from './dto/account-res.dto';

@Injectable()
export class AccountClientService {
  constructor(
    @Inject('ACCOUNT_SERVICE') private readonly client: ClientProxy,
  ) {}

  async getUserInfo(accountId: number): Promise<AccountResDto> {
    return await firstValueFrom(
      this.client.send({ cmd: 'account.get-user-info' }, { accountId }),
    );
  }

  async getUsersInfo(accountIds: number[]): Promise<AccountResDto[]> {
    return await firstValueFrom(
      this.client.send({ cmd: 'account.get-users-info' }, { accountIds }),
    );
  }
}
