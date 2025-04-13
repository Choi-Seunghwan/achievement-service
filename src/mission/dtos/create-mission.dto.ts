import { IsOptional, IsString } from 'class-validator';

export class CreateMissionDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
