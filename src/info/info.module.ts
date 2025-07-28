import { Module } from '@nestjs/common';
import { InfoController } from './info.controller';
import { InfoService } from './info.service';
import { MissionModule } from 'src/mission/mission.module';
import { AchievementModule } from 'src/achievement/achievement.module';

@Module({
  imports: [MissionModule, AchievementModule],
  controllers: [InfoController],
  providers: [InfoService],
})
export class InfoModule {}
