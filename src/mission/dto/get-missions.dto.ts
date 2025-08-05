import { MissionStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class GetMissionsDto {
  @IsNumber()
  page: number = 1;

  @IsNumber()
  size: number = 20;

  @IsEnum(MissionStatus)
  @IsOptional()
  status?: MissionStatus;

  @IsNumber()
  @IsOptional()
  tagId?: number;
}
