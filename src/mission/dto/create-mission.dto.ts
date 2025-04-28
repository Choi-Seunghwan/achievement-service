import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateMissionTaskDto } from './create-mission-task.dto';
import { MissionRepeatDay, MissionRepeatType } from '@prisma/client';

export class CreateMissionDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsOptional()
  @IsArray()
  tasks?: CreateMissionTaskDto[];

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
