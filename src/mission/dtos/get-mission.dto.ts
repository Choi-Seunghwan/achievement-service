import { IsNumber } from 'class-validator';

export class GetMissionDto {
  @IsNumber()
  missionId: number;
}
