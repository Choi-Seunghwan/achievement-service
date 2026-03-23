import { PublicMissionResDto } from 'src/mission/dto/public-mission-res.dto';

export class PublicAchievementResDto {
  id: number;
  name: string;
  description: string;
  icon: string;
  isParticipating: boolean;
  category?: string;
  startDate?: Date;
  endDate?: Date;

  // 시즌 업적 남은 일수
  remainingDays?: number;

  _count?: {
    participants?: number;
  };

  missions?: PublicMissionResDto[];
}
