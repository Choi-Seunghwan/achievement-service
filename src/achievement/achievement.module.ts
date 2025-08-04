import { Module } from '@nestjs/common';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { AchievementRepository } from './achievement.repository';
import { MissionModule } from 'src/mission/mission.module';

@Module({
  imports: [MissionModule],
  controllers: [AchievementController],
  providers: [AchievementService, AchievementRepository],
  exports: [AchievementService],
})
export class AchievementModule {}
