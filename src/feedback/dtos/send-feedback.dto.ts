import { IsString } from 'class-validator';

export class sendFeedbackDto {
  @IsString()
  content: string;
}
