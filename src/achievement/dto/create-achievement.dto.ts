import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class CreateAchievementDto {
  @IsString()
  @Length(1, 50)
  name: string;

  @IsString()
  @Length(0, 500)
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsArray()
  missionIds: number[];
}
