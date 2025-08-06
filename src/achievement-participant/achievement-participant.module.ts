import { Module } from '@nestjs/common';
import { AchievementParticipantService } from './achievement-participant.service';
import { AchievementParticipantRepository } from './achievement-participant.repository';
import { AchievementParticipantController } from './achievement.participant.controller';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [AccountModule],
  controllers: [AchievementParticipantController],
  providers: [AchievementParticipantService, AchievementParticipantRepository],
  exports: [AchievementParticipantService],
})
export class AchievementParticipantModule {}
