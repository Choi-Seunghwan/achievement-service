import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateAchievementDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsArray()
  missionIds: number[];
}
