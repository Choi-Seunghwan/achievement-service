import { Injectable } from '@nestjs/common';
import { AchievementService } from 'src/achievement/achievement.service';
import { MissionService } from 'src/mission/mission.service';
import { PrismaService } from 'src/database/prisma.service';
import { AchievementStatus, MissionStatus } from '@prisma/client';
import { startOfDay, subDays } from 'date-fns';
import {
  DashboardResDto,
  InProgressAchievementDto,
  PopularPublicAchievementDto,
} from './dto/dashboard-res.dto';

@Injectable()
export class InfoService {
  constructor(
    private readonly achievementService: AchievementService,
    private readonly missionService: MissionService,
    private readonly prismaService: PrismaService,
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

  /** 성장 포트폴리오 프로필 데이터 조회 */
  async getProfile(accountId: number) {
    // 달성한 업적 목록
    const completedAchievements =
      await this.achievementService.getCompletedAchievements(accountId);

    // 미션/업적 통계
    const { completedCount: totalAchievementsCompleted } =
      await this.achievementService.getUserAchievementCount(accountId);

    const { completedCount: totalMissionsCompleted } =
      await this.missionService.getUserMissionCount(accountId);

    // 카테고리별 달성 수 집계
    const categoryCounts: Record<string, number> = {};
    for (const achievement of completedAchievements) {
      const category =
        achievement.publicAchievement?.category || '개인 업적';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }

    return {
      completedAchievements: completedAchievements.map((a) => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        completedAt: a.completedAt,
      })),
      stats: {
        totalMissionsCompleted,
        totalAchievementsCompleted,
        categoryCounts,
      },
    };
  }

  /**
   * 대시보드 데이터 조회
   */
  async getDashboard(accountId: number): Promise<DashboardResDto> {
    const [streak, completedAchievements, inProgressAchievements, popularPublicAchievements] =
      await Promise.all([
        this.calculateStreak(accountId),
        this.getCompletedAchievementCount(accountId),
        this.getInProgressAchievements(accountId),
        this.getPopularPublicAchievements(),
      ]);

    return {
      streak,
      completedAchievements,
      inProgressAchievements,
      popularPublicAchievements,
    };
  }

  /**
   * 연속 달성 일수 계산
   * 오늘부터 역순으로, 하루에 completed=true 기록이 있는 연속 일수를 계산
   */
  private async calculateStreak(accountId: number): Promise<number> {
    // 최근 365일까지의 완료 기록을 날짜별로 그룹핑하여 조회
    const histories = await this.prismaService.$queryRaw<
      { date: Date; count: bigint }[]
    >`
      SELECT DATE(mh.created_at) as date, COUNT(*) as count
      FROM mission_histories mh
      INNER JOIN mission m ON m.id = mh.mission_id
      WHERE m.account_id = ${accountId}
        AND m.deleted_at IS NULL
        AND mh.completed = true
        AND mh.task_id IS NULL
        AND mh.created_at >= ${subDays(startOfDay(new Date()), 365)}
      GROUP BY DATE(mh.created_at)
      ORDER BY date DESC
    `;

    if (!histories || histories.length === 0) return 0;

    let streak = 0;
    const today = startOfDay(new Date());

    for (let i = 0; i < histories.length; i++) {
      const expectedDate = startOfDay(subDays(today, i));
      const historyDate = startOfDay(new Date(histories[i].date));

      if (expectedDate.getTime() === historyDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * 달성한 업적 수
   */
  private async getCompletedAchievementCount(accountId: number): Promise<number> {
    return this.prismaService.achievement.count({
      where: {
        accountId,
        status: AchievementStatus.COMPLETED,
        deletedAt: null,
      },
    });
  }

  /**
   * 진행 중인 업적 진행률
   */
  private async getInProgressAchievements(
    accountId: number,
  ): Promise<InProgressAchievementDto[]> {
    const achievements = await this.prismaService.achievement.findMany({
      where: {
        accountId,
        status: AchievementStatus.IN_PROGRESS,
        deletedAt: null,
      },
      include: {
        missions: {
          where: { deletedAt: null },
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return achievements.map((achievement) => ({
      id: achievement.id,
      name: achievement.name,
      icon: achievement.icon ?? '',
      totalMissions: achievement.missions.length,
      completedMissions: achievement.missions.filter(
        (m) => m.status === MissionStatus.COMPLETED,
      ).length,
    }));
  }

  /**
   * 인기 공개 업적 미리보기 (상위 3개)
   */
  private async getPopularPublicAchievements(): Promise<
    PopularPublicAchievementDto[]
  > {
    const publicAchievements =
      await this.prismaService.publicAchievement.findMany({
        where: { deletedAt: null },
        include: {
          _count: {
            select: {
              participants: {
                where: { leavedAt: null },
              },
            },
          },
        },
        orderBy: {
          participants: { _count: 'desc' },
        },
        take: 3,
      });

    return publicAchievements.map((pa) => ({
      id: pa.id,
      name: pa.name,
      icon: pa.icon ?? '',
      description: pa.description ?? '',
      participantCount: pa._count.participants,
    }));
  }
}
