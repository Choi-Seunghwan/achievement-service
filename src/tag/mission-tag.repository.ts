import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class MissionTagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMissionTag(missionId: number, tagId: number) {
    return await this.prisma.missionTag.findFirst({
      where: { missionId, tagId, deletedAt: null },
    });
  }

  async restoreMissionTag(id: number) {
    return await this.prisma.missionTag.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async createMissionTag(missionId: number, tagId: number) {
    return await this.prisma.missionTag.create({
      data: { missionId, tagId },
    });
  }

  async deleteMissionTag(id: number) {
    return await this.prisma.missionTag.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
