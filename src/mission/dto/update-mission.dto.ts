import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { MissionRepeatDay, MissionRepeatType } from '@prisma/client';
import { UpdateMissionTaskDto } from './update-mission-task.dto';

export class UpdateMissionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
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
