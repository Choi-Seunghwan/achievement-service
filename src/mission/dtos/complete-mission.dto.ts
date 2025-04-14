import { IsNumber } from 'class-validator';

export class CompleteMissionDto {
  @IsNumber()
  missionId: number;
}
