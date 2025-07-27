import { PublicAchievementResDto } from '../dtos/public-achievement-res.dto';

export default function toPublicAchievementResDto(
  item: any,
  isParticipating: boolean,
): PublicAchievementResDto {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    icon: item.icon,
    _count: item._count,
    missions: item.missions,
    isParticipating,
  };
}
