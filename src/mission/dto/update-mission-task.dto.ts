import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class UpdateMissionTaskDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @Length(1, 50)
  name: string;
}
