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
import { InfoModule } from './info/info.module';
import { AccountModule } from './account/account.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // IP 기반 요청 제한: 60초당 60회
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 60,
        },
      ],
    }),
    DatabaseModule,
    AuthorizationModule.forRoot({ jwtSecret: process.env.JWT_SECRET }),
    AccountModule,
    FeedbackModule,
    MissionModule,
    TagModule,
    AchievementModule,
    PublicAchievementModule,
    PublicMissionTaskModule,
    AchievementParticipantModule,
    InfoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    // 전역 Rate Limiting 가드 등록
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
