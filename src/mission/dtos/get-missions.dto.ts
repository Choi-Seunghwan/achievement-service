import { MissionStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class GetMissionsDto {
  @IsNumber()
  page: number;

  @IsNumber()
  size: number;

  @IsEnum(MissionStatus)
  @IsOptional()
  status?: MissionStatus;
}
