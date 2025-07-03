import { Module } from '@nestjs/common';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { AchievementRepository } from './achievement.repository';

@Module({
  controllers: [AchievementController],
  providers: [AchievementService, AchievementRepository],
  exports: [AchievementService],
})
export class AchievementModule {}
