import { IsArray, IsOptional, IsString } from 'class-validator';
import { MissionTaskDto } from './mission-task-dto';

export class UpdateMissionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsArray()
  tasks?: MissionTaskDto[];
}
