import { IsNumber, IsOptional } from 'class-validator';

export class getPublicAchievementCommentsDto {
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  size?: number = 20;
}
