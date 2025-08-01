// account-client.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AccountClientService } from './account-client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ACCOUNT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0',
          port: Number(process.env.ACCOUNT_SERVICE_PORT),
        },
      },
    ]),
  ],
  providers: [AccountClientService],
  exports: [ClientsModule, AccountClientService],
})
export class AccountClientModule {}
