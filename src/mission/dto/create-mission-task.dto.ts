import { IsString, Length } from 'class-validator';

export class CreateMissionTaskDto {
  @IsString()
  @Length(1, 50)
  name: string;
}
