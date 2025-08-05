import { IsArray, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { CreateMissionTaskDto } from './create-mission-task.dto';
import { MissionRepeatDay, MissionRepeatType } from '@prisma/client';

export class CreateMissionDto {
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
