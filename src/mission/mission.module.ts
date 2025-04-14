import { Module } from '@nestjs/common';
import { MissionController } from './mission.controller';
import { MissionService } from './mission.service';
import { MissionRepository } from './mission.repository';

@Module({
  controllers: [MissionController],
  providers: [MissionService, MissionRepository],
})
export class MissionModule {}
