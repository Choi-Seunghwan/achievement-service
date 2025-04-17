import { IsString } from 'class-validator';

export class CreateMissionTaskDto {
  @IsString()
  name: string;
}
