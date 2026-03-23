/** 달성한 업적 항목 */
export class CompletedAchievementDto {
  id: number;
  name: string;
  icon: string;
  completedAt: Date;
}

/** 통계 */
export class ProfileStatsDto {
  totalMissionsCompleted: number;
  totalAchievementsCompleted: number;
  categoryCounts: Record<string, number>;
}

/** 프로필 (성장 포트폴리오) 응답 DTO */
export class ProfileResDto {
  completedAchievements: CompletedAchievementDto[];
  stats: ProfileStatsDto;
}
