import { Injectable } from '@nestjs/common';
import { AchievementRepository } from './achievement.repository';

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
}
