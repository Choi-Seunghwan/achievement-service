import { IsNumber } from 'class-validator';

export class TagIdParam {
  @IsNumber()
  tagId: number;
}
