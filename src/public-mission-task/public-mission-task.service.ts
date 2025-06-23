import { Injectable } from '@nestjs/common';
import { PublicMissionTaskRepository } from './public-mission-task.repository';

@Injectable()
export class PublicMissionTaskService {
  constructor(
    private readonly publicMissionTaskRepository: PublicMissionTaskRepository,
  ) {}

  async createPublicMissionTasks(
    publicMissionId: number,
    tasks: { name: string }[],
  ) {
    return this.publicMissionTaskRepository.createMany(
      tasks.map((t) => ({
        name: t.name,
        publicMissionId,
      })),
    );
  }
}
