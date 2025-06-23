import { Injectable } from '@nestjs/common';
import { PublicAchievementRepository } from './public-achievement.repository';
import { Transactional } from '@nestjs-cls/transactional';
import { MissionService } from 'src/mission/mission.service';
import { PublicMissionTaskService } from 'src/public-mission-task/public-mission-task.service';

@Injectable()
export class PublicAchievementService {
  constructor(
    private readonly publicAchievementRepository: PublicAchievementRepository,
    private readonly missionService: MissionService,
    private readonly publicMissionTaskService: PublicMissionTaskService,
  ) {}

  @Transactional()
  async createPublicAchievement(
    accountId: number,
    data: {
      name: string;
      description: string;
      icon: string;
      missionIds: number[];
    },
  ) {
    const missions = await this.missionService.getMissions(
      accountId,
      data.missionIds,
    );

    const publicMissionData = missions.map((mission) => ({
      name: mission.name,
      icon: mission.icon,
      repeatType: mission.repeatType,
      repeatDays: mission.repeatDays,
      description: mission.description,
    }));

    const publicAchievement =
      await this.publicAchievementRepository.createPublicAchievement({
        creatorId: accountId,
        name: data.name,
        description: data.description,
        icon: data.icon,
        missions: {
          createMany: {
            data: publicMissionData,
          },
        },
      });

    const publicMissions = publicAchievement.missions;

    await Promise.all(
      publicMissions.map((publicMission, i) => {
        const originalMission = missions[i];

        if (!originalMission.missionTasks?.length) return Promise.resolve();

        return this.publicMissionTaskService.createPublicMissionTasks(
          publicMission.id,
          originalMission.missionTasks.map((task) => ({ name: task.name })),
        );
      }),
    );
  }

  async getPublicAchievements() {}
}
