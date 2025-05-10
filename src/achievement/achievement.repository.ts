import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AchievementRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createAchievement(args: Prisma.AchievementCreateArgs) {
    return await this.prismaService.achievement.create(args);
  }
}
