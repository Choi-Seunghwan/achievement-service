import { BadRequestException, Injectable } from '@nestjs/common';
import { AchievementRepository } from './achievement.repository';
import { AchievementStatus, MissionStatus } from '@prisma/client';

@Injectable()
export class AchievementService {
  constructor(private readonly achievementRepository: AchievementRepository) {}

  async createAchievement(
    accountId: number,
    data: {
      name: string;
      missionIds: number[];
      description?: string;
      icon?: string;
    },
  ) {
    return await this.achievementRepository.createAchievement({
      data: {
        accountId,
        missions: {
          connect: data.missionIds.map((id) => ({ id })),
        },
        name: data.name,
        description: data.description,
        icon: data.icon,
      },
    });
  }

  async createAchievementWithPublicData(
    accountId: number,
    data: {
      publicMissionIds: number[];
      name: string;
      description?: string;
      icon?: string;
      publicAchievementId: number;
    },
  ) {
    return await this.achievementRepository.createAchievement({
      data: {
        accountId,
        name: data.name,
        description: data.description,
        icon: data.icon,
        publicAchievementId: data.publicAchievementId,
      },
    });
  }

  async getUserAchievements(
    accountId: number,
    paging: { page: number; size: number },
    status: AchievementStatus,
  ) {
    return await this.achievementRepository.getUserAchievementsWithPaging(
      accountId,
      status,
      paging,
    );
  }

  async completeAchievement(accountId: number, achievementId: number) {
    const achievement = await this.achievementRepository.getUserAchievement(
      accountId,
      achievementId,
    );

    if (!achievement) throw new BadRequestException('Achievement not found');

    if (
      !achievement.missions.every(
        (mission) => mission.status === MissionStatus.COMPLETED,
      )
    )
      throw new BadRequestException('All missions are not completed');

    await this.achievementRepository.updateAchievement(achievementId, {
      completedAt: new Date(),
      status: AchievementStatus.COMPLETED,
    });
  }
}
