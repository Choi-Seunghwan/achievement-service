import { PublicMissionResDto } from 'src/mission/dto/public-mission-res.dto';

export class PublicAchievementResDto {
  id: number;
  name: string;
  description: string;
  icon: string;
  isParticipating: boolean;

  _count?: {
    participants?: number;
  };

  missions?: PublicMissionResDto[];
}
