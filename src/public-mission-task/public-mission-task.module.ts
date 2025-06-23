import { Module } from '@nestjs/common';
import { PublicMissionTaskService } from './public-mission-task.service';
import { PublicMissionTaskRepository } from './public-mission-task.repository';

@Module({
  providers: [PublicMissionTaskService, PublicMissionTaskRepository],
  exports: [PublicMissionTaskService],
})
export class PublicMissionTaskModule {}
