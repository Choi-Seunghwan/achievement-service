import { Injectable } from '@nestjs/common';
import { PublicAchievementRepository } from './public-achievement.repository';
import { Transactional } from '@nestjs-cls/transactional';
import { MissionService } from 'src/mission/mission.service';
import { PublicMissionTaskService } from 'src/public-mission-task/public-mission-task.service';
import { AchievementService } from 'src/achievement/achievement.service';

@Injectable()
export class PublicAchievementService {
  constructor(
    private readonly publicAchievementRepository: PublicAchievementRepository,
    private readonly publicMissionTaskService: PublicMissionTaskService,
    private readonly achievementService: AchievementService,
    private readonly missionService: MissionService,
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

    if (missions.some((m) => m.publicMissionId)) {
      throw new Error(
        'Some missions are already connected with a public missions.',
      );
    }

    // 공개 미션 데이터 생성
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
        // 공개 미션 생성
        missions: {
          createMany: {
            data: publicMissionData,
          },
        },
        // 참여자 생성
        participants: {
          create: {
            accountId,
            jointedAt: new Date(),
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

    // 유저 개인 업적 생성
    const achievement =
      await this.achievementService.createAchievementWithPublicData(accountId, {
        publicMissionIds: publicMissions.map((m) => m.id),
        name: publicAchievement.name,
        description: publicAchievement.description,
        icon: publicAchievement.icon,
        publicAchievementId: publicAchievement.id,
      });

    // 미션, 공개 미션 매핑. 반드시 index 순서가 맞아야 함
    const missionMap = missions.reduce(
      (acc, mission, i) => {
        acc[mission.id] = publicMissions[i].id;
        return acc;
      },
      {} as Record<number, number>,
    );

    // 공개 미션과 유저 미션 연결
    await this.missionService.connectMissionsWithPublicData(
      accountId,
      achievement.id,
      missionMap,
    );
  }

  async getPublicAchievements(
    accountId: number,
    paging: { page: number; size: number },
  ) {
    const result = await this.publicAchievementRepository.getPublicAchievements(
      {},
      paging,
    );

    return result;
  }

  async getPopularPublicAchievements(accountId: number) {
    return await this.publicAchievementRepository.getPublicAchievements(
      {
        orderBy: [
          {
            participants: { _count: 'desc' },
          },
          {
            createdAt: 'desc',
          },
        ],
      },
      { page: 1, size: 10 },
    );
  }
}
