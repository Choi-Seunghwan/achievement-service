import { PublicAchievementResDto } from '../dtos/public-achievement-res.dto';

// 남은 일수 계산
function calcRemainingDays(endDate?: Date | null): number | undefined {
  if (!endDate) return undefined;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

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
    category: item.category ?? undefined,
    startDate: item.startDate ?? undefined,
    endDate: item.endDate ?? undefined,
    remainingDays: calcRemainingDays(item.endDate),
  };
}
