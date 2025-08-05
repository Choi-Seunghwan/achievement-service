import { IsArray, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { MissionRepeatDay, MissionRepeatType } from '@prisma/client';
import { UpdateMissionTaskDto } from './update-mission-task.dto';

export class UpdateMissionDto {
  @IsOptional()
  @Length(1, 50)
  @IsString()
  name?: string;

  @IsString()
  @Length(0, 500)
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsOptional()
  @IsArray()
  tasks?: UpdateMissionTaskDto[];

  @IsOptional()
  @IsEnum(MissionRepeatType)
  repeatType?: MissionRepeatType;

  @IsOptional()
  @IsArray()
  repeatDays?: MissionRepeatDay[];

  @IsOptional()
  @IsArray()
  tagIds?: number[];
}
