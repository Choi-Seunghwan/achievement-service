// account-client.module.ts

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
  exports: [ClientsModule],
})
export class AccountClientModule {}
