import { IsNumber } from 'class-validator';

export class getPublicAchievementCommentDto {
  @IsNumber()
  page: number = 1;

  @IsNumber()
  size: number = 20;
}
