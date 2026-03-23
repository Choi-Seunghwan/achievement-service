import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AccountRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAccount(args: Prisma.AccountFindFirstArgs) {
    return await this.prismaService.account.findFirst({
      ...args,
      where: {
        ...args.where,
        deletedAt: null,
      },
    });
  }

  async findUniqueAccount(args: Prisma.AccountFindUniqueArgs) {
    return await this.prismaService.account.findUnique({
      ...args,
      where: {
        ...args.where,
        deletedAt: null,
      },
    });
  }

  async findAccounts(args: Prisma.AccountFindManyArgs) {
    return await this.prismaService.account.findMany({
      ...args,
      where: {
        ...args.where,
        deletedAt: null,
      },
    });
  }

  async createAccount(args: Prisma.AccountCreateArgs) {
    return await this.prismaService.account.create(args);
  }

  async updateAccount(args: Prisma.AccountUpdateArgs) {
    return await this.prismaService.account.update({
      ...args,
      where: {
        ...args.where,
        deletedAt: null,
      },
    });
  }
}
