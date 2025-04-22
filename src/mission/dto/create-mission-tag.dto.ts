import { IsOptional, IsString } from 'class-validator';

export class CreateMissionTagDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  color?: string;
}
