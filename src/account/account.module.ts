// account.module.ts

import { Module } from '@nestjs/common';
import { AccountClientModule } from './account-client.module';
import { AccountClientService } from './account-client.service';

@Module({
  imports: [AccountClientModule],
  providers: [AccountClientService],
  exports: [AccountClientService],
})
export class AccountModule {}
