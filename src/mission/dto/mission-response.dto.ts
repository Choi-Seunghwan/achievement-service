import { MissionStatus } from '@prisma/client';

export class MissionResponseDto {
  id: number;
  title: string;
  description?: string;
  status: MissionStatus;
  createdAt: Date;
  updatedAt?: Date;
}
