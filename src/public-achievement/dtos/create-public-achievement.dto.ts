import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePublicAchievementDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  missionIds: number[];
}
