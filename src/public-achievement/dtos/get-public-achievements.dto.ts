import { IsNumber } from 'class-validator';

export class GetPublicAchievementsDto {
  @IsNumber()
  page: number = 1;

  @IsNumber()
  size: number = 20;
}
