import { Module } from '@nestjs/common';
import { AchievementParticipantService } from './achievement-participant.service';
import { AchievementParticipantRepository } from './achievement-participant.repository';
import { AchievementParticipantController } from './achievement.participant.controller';

@Module({
  controllers: [AchievementParticipantController],
  providers: [AchievementParticipantService, AchievementParticipantRepository],
  exports: [AchievementParticipantService],
})
export class AchievementParticipantModule {}
