import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PublicAchievementRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createPublicAchievement(data: Prisma.PublicAchievementCreateInput) {
    return this.prismaService.publicAchievement.create({
      data,
      include: { missions: true },
    });
  }
}
