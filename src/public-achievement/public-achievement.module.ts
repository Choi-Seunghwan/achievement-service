import { Module } from '@nestjs/common';
import { MissionModule } from 'src/mission/mission.module';
import { PublicAchievementController } from './public-achievement.controller';
import { PublicAchievementService } from './public-achievement.service';
import { PublicAchievementRepository } from './public-achievement.repository';
import { PublicMissionTaskModule } from 'src/public-mission-task/public-mission-task.module';
import { AchievementModule } from 'src/achievement/achievement.module';
import { PublicAchievementCommentRepository } from './public-achievement-comment.repository.';
import { AccountClientModule } from 'src/account/account-client.module';
import { AchievementParticipantModule } from 'src/achievement-participant/achievement-participant.module';

@Module({
  imports: [
    MissionModule,
    PublicMissionTaskModule,
    AchievementModule,
    AccountClientModule,
    AchievementParticipantModule,
  ],
  controllers: [PublicAchievementController],
  providers: [
    PublicAchievementService,
    PublicAchievementRepository,
    PublicAchievementCommentRepository,
  ],
})
export class PublicAchievementModule {}
