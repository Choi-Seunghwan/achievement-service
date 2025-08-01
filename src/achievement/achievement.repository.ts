import { Injectable } from '@nestjs/common';
import { AchievementStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AchievementRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createAchievement(args: Prisma.AchievementCreateArgs) {
    return await this.prismaService.achievement.create(args);
  }

  async getUserAchievementsWithPaging(
    accountId: number,
    status: AchievementStatus,
    paging: { page: number; size: number },
  ) {
    const total = await this.prismaService.achievement.count({
      where: { accountId, status, deletedAt: null },
    });
    const items = await this.prismaService.achievement.findMany({
      where: { accountId, status, deletedAt: null },
      skip: (paging.page - 1) * paging.size,
      take: paging.size,
      orderBy: { createdAt: 'desc' },
      include: {
        missions: true,
        publicAchievement: true,
      },
    });

    return { total, items };
  }

  async getUserAchievement(accountId: number, achievementId: number) {
    return await this.prismaService.achievement.findFirst({
      where: { id: achievementId, accountId, deletedAt: null },
      include: {
        missions: true,
        publicAchievement: true,
      },
    });
  }

  async updateAchievement(
    achievementId: number,
    data: Prisma.AchievementUpdateInput,
  ) {
    return await this.prismaService.achievement.update({
      where: { id: achievementId, deletedAt: null },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async getAchievementCount(accountId: number) {
    const [inProgressCount, completedCount] = await Promise.all([
      this.prismaService.achievement.count({
        where: {
          accountId,
          status: AchievementStatus.IN_PROGRESS,
          deletedAt: null,
        },
      }),
      this.prismaService.achievement.count({
        where: {
          accountId,
          status: AchievementStatus.COMPLETED,
          deletedAt: null,
        },
      }),
    ]);

    return { inProgressCount, completedCount };
  }
}
