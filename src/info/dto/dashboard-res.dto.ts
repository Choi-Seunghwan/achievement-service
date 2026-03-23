/**
 * 대시보드 응답 DTO
 */

export class InProgressAchievementDto {
  id: number;
  name: string;
  icon: string;
  totalMissions: number;
  completedMissions: number;
}

export class PopularPublicAchievementDto {
  id: number;
  name: string;
  icon: string;
  description: string;
  participantCount: number;
}

export class DashboardResDto {
  /** 연속 달성 일수 */
  streak: number;
  /** 달성한 업적 수 */
  completedAchievements: number;
  /** 진행 중인 업적 진행률 */
  inProgressAchievements: InProgressAchievementDto[];
  /** 인기 공개 업적 미리보기 (상위 3개) */
  popularPublicAchievements: PopularPublicAchievementDto[];
}
