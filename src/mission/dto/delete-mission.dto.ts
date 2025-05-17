import { IsNumber } from 'class-validator';

export class DeleteMissionDto {
  @IsNumber()
  missionId: number;
}
