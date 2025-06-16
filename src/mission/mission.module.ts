import { Module } from '@nestjs/common';
import { MissionController } from './mission.controller';
import { MissionService } from './mission.service';
import { MissionRepository } from './mission.repository';
import { TagModule } from 'src/tag/tag.module';

@Module({
  imports: [TagModule],
  controllers: [MissionController],
  providers: [MissionService, MissionRepository],
})
export class MissionModule {}
