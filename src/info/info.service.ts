import { Injectable } from '@nestjs/common';
import { AchievementService } from 'src/achievement/achievement.service';
import { MissionService } from 'src/mission/mission.service';

@Injectable()
export class InfoService {
  constructor(
    private readonly achievementService: AchievementService,
    private readonly missionService: MissionService,
  ) {}

  async getStatusCount(accountId: number) {
    const {
      inProgressCount: achievementInProgressCount,
      completedCount: achievementCompletedCount,
    } = await this.achievementService.getUserAchievementCount(accountId);

    const {
      inProgressCount: missionInProgressCount,
      completedCount: missionCompletedCount,
    } = await this.missionService.getUserMissionCount(accountId);

    return {
      achievementInProgressCount,
      achievementCompletedCount,
      missionInProgressCount,
      missionCompletedCount,
    };
  }
}
