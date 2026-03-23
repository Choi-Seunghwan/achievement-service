import { IsString } from 'class-validator';

export class UpdateImageDto {
  @IsString()
  image: string;
}
