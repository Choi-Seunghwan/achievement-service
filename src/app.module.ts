import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthorizationModule } from '@choi-seunghwan/authorization';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';
import { MissionModule } from './mission/mission.module';
import { TagModule } from './tag/tag.module';
import { AchievementModule } from './achievement/achievement.module';
import { PublicAchievementModule } from './public-achievement/public-achievement.module';
import { PublicMissionTaskModule } from './public-mission-task/public-mission-task.module';
import { AchievementParticipantModule } from './achievement-participant/achievement-participant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthorizationModule.forRoot({ jwtSecret: process.env.JWT_SECRET }),
    MissionModule,
    TagModule,
    AchievementModule,
    PublicAchievementModule,
    PublicMissionTaskModule,
    AchievementParticipantModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
