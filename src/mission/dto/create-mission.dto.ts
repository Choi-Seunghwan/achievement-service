import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateMissionTaskDto } from './create-mission-task.dto';
import { MissionRepeatDay, MissionRepeatType } from '@prisma/client';
import { CreateMissionTagDto } from './create-mission-tag.dto';

export class CreateMissionDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

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
  tags?: CreateMissionTagDto[];
}
