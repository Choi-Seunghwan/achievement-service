import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PublicAchievementRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createPublicAchievement(data: Prisma.PublicAchievementCreateInput) {
    return await this.prismaService.publicAchievement.create({
      data,
      include: { missions: true },
    });
  }

  async getPublicAchievements(
    args: Prisma.PublicAchievementFindManyArgs,
    paging: { page: number; size: number },
  ) {
    const items = await this.prismaService.publicAchievement.findMany({
      where: { ...args.where, deletedAt: null },
      skip: (paging.page - 1) * paging.size,
      take: paging.size,
      include: {
        ...args.include,
        missions: { where: { deletedAt: null } },
        _count: {
          select: {
            participants: {
              where: {
                leavedAt: null,
              },
            },
          },
        },
      },
      orderBy: args.orderBy || { createdAt: 'desc' },
    });

    const total = await this.prismaService.publicAchievement.count({
      where: { ...args.where, deletedAt: null },
    });

    return { total, items };
  }

  async getPublicAchievement(args: Prisma.PublicAchievementFindUniqueArgs) {
    return await this.prismaService.publicAchievement.findFirst({
      where: { ...args.where, deletedAt: null },
      include: {
        ...args.include,
        missions: { where: { deletedAt: null } },
        _count: {
          select: {
            participants: {
              where: {
                leavedAt: null,
              },
            },
          },
        },
      },
    });
  }
}
