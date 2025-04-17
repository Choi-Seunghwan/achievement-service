import { IsNumber, IsString } from 'class-validator';

export class MissionTaskDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;
}
