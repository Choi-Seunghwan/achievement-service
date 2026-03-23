import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetPublicAchievementsDto {
  @IsNumber()
  page: number = 1;

  @IsNumber()
  size: number = 20;

  @IsString()
  @IsOptional()
  keyword?: string;

  // 카테고리 필터
  @IsString()
  @IsOptional()
  category?: string;
}
