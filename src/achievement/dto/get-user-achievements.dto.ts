import { PagingRequestDto } from '@choi-seunghwan/api-util';
import { IsEnum, IsOptional } from 'class-validator';
import { AchievementStatus } from '@prisma/client';

export class GetUserAchievementsDto extends PagingRequestDto {
  @IsEnum(AchievementStatus)
  @IsOptional()
  status?: AchievementStatus;
}
