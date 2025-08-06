import { IsNumber, IsOptional } from 'class-validator';

export class GetPublicAchievementParticipantsDto {
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  size?: number = 20;
}
