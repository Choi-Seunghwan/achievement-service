import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { TagRepository } from './tag.repository';
import { MissionTagRepository } from './mission-tag.repository';

@Module({
  controllers: [TagController],
  providers: [TagService, TagRepository, MissionTagRepository],
  exports: [TagService],
})
export class TagModule {}
