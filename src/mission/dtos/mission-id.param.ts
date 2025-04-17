import { IsNumber } from 'class-validator';

export class MissionIdParam {
  @IsNumber()
  missionId: number;
}
