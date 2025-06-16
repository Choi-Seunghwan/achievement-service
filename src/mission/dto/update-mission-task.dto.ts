import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMissionTaskDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  name: string;
}
