import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AchievementParticipantRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getPublicParticipant(accountId: number, publicAchievementId: number) {
    return await this.prismaService.achievementParticipant.findFirst({
      where: { accountId, publicAchievementId, leavedAt: null },
      orderBy: {
        jointedAt: 'desc',
      },
    });
  }

  // 유저가 공개 업적들에 참여 중인지 확인
  async getUserParticipating(
    accountId: number,
    publicAchievementIds: number[],
  ) {
    return await this.prismaService.achievementParticipant.findMany({
      where: {
        accountId,
        publicAchievementId: { in: publicAchievementIds },
        leavedAt: null,
      },
      select: { publicAchievementId: true },
    });
  }

  async getUserParticipatingAchievements(accountId: number) {
    return await this.prismaService.achievementParticipant.findMany({
      where: {
        accountId,
        leavedAt: null,
        publicAchievement: { deletedAt: null },
      },
      orderBy: { jointedAt: 'desc' },
      include: {
        publicAchievement: {
          include: { missions: true },
        },
      },
    });
  }

  async create(accountId: number, publicAchievementId: number) {
    return await this.prismaService.achievementParticipant.create({
      data: {
        accountId,
        publicAchievementId,
        jointedAt: new Date(),
      },
    });
  }

  async updateLeavedAt(
    achievementParticipantId: number,
    accountId: number,
    publicAchievementId: number,
  ) {
    return await this.prismaService.achievementParticipant.update({
      where: { id: achievementParticipantId, accountId, publicAchievementId },
      data: { leavedAt: new Date() },
    });
  }
}
