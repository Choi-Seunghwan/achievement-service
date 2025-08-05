import { BadRequestException, Injectable } from '@nestjs/common';
import { AchievementRepository } from './achievement.repository';
import { AchievementStatus, MissionStatus } from '@prisma/client';
import { MissionView } from 'src/mission/view/mission-view';
import { MissionService } from 'src/mission/mission.service';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class AchievementService {
  constructor(
    private readonly achievementRepository: AchievementRepository,
    private readonly missionService: MissionService,
  ) {}

  async getUserAchievementCount(accountId: number) {
    return await this.achievementRepository.getAchievementCount(accountId);
  }

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
  async deleteAchievement(accountId: number, achievementId: number) {
    const achievement = await this.achievementRepository.getUserAchievement(
      accountId,
      achievementId,
    );

    if (!achievement) throw new BadRequestException('Not found achievement');

    await this.missionService.disconnectAchievement(
      accountId,
      achievement.missions.map((m) => m.id),
    );

    await this.achievementRepository.update(achievement.id, {
      deletedAt: new Date(),
    });
  }

  // 공개 업적 Id 로, 업적, 미션 제거
  @Transactional()
  async deleteAchievementByPublicAchievementId(
    accountId: number,
    publicAchievementId: number,
  ) {
    const achievement = await this.achievementRepository.getWithMissions({
      where: {
        accountId,
        publicAchievementId,
      },
    });

    if (!achievement) throw new BadRequestException('Not found achievement');

    await this.missionService.disconnectAchievement(
      accountId,
      achievement.missions.map((m) => m.id),
    );

    await this.achievementRepository.update(achievement.id, {
      deletedAt: new Date(),
    });

    return true;
  }

  async getAchievement(accountId: number, achievementId: number) {
    return await this.achievementRepository.getUserAchievement(
      accountId,
      achievementId,
    );
  }

  async getUserActiveAchievements(accountId: number) {
    const achievements =
      await this.achievementRepository.getUserAchievements(accountId);

    // achievement 에서, mission todayCompleted 여부

    const res = achievements.map((achievement) => {
      return {
        ...achievement,
        missions: achievement.missions.map((mission) => {
          return {
            ...mission,
            todayCompleted: mission?.missionHistories?.[0]?.completed === true,
          };
        }) as MissionView[],
      };
    });

    return res;
  }

  async getUserAchievements(
    accountId: number,
    paging: { page: number; size: number },
    status: AchievementStatus,
  ) {
    const result =
      await this.achievementRepository.getUserAchievementsWithPaging(
        accountId,
        status,
        paging,
      );

    return {
      total: result.total,
      items: result.items.map((item) => {
        return {
          ...item,
          missions: item.missions.map((mission) => {
            return {
              ...mission,
              todayCompleted:
                mission?.missionHistories?.[0]?.completed === true,
            };
          }) as MissionView[],
        };
      }),
    };
  }

  async completeAchievement(accountId: number, achievementId: number) {
    const achievement = await this.achievementRepository.getUserAchievement(
      accountId,
      achievementId,
    );

    if (!achievement) throw new BadRequestException('Achievement not found');

    const allCompleted = achievement.missions.every(
      (mission) =>
        mission.status === MissionStatus.COMPLETED ||
        mission.missionHistories?.[0]?.completed === true,
    );

    if (!allCompleted)
      throw new BadRequestException('All missions are not completed');

    await this.achievementRepository.updateAchievement(achievementId, {
      completedAt: new Date(),
      status: AchievementStatus.COMPLETED,
    });

    await Promise.all(
      achievement.missions
        .filter((m) => m.status !== MissionStatus.COMPLETED)
        .map((m) => {
          return this.missionService.completeMissionWithHistory(
            accountId,
            m.id,
          );
        }),
    );

    return true;
  }
}
