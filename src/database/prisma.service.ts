import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  async onModuleInit() {
    await this.$connect();
  }

  async executeTransaction(callback: (prisma: PrismaClient) => Promise<any>) {
    return await callback(this);
  }
}
