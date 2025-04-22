import { IsNumber } from 'class-validator';

export class TaskIdParam {
  @IsNumber()
  taskId: number;
}
