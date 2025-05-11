import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class MissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMissionsWithPaging(
    args: Prisma.MissionFindManyArgs,
    paging: { page: number; size: number },
  ) {
    const total = await this.prisma.mission.count({
      where: { ...args.where, deletedAt: null },
    });

    const items = await this.prisma.mission.findMany({
      ...args,
      skip: (paging.page - 1) * paging.size,
      take: paging.size,
      where: { ...args.where, deletedAt: null },
      include: { ...args.include },
      orderBy: { createdAt: 'desc', ...args.orderBy },
      omit: { ...args.omit, deletedAt: true },
    });

    return { total, items };
  }

  async getMissions(args: Prisma.MissionFindManyArgs) {
    return await this.prisma.mission.findMany({
      ...args,
      where: { ...args.where, deletedAt: null },
      include: {
        missionTasks: true,
        missionTags: { include: { tag: true } },
        ...args.include,
      },
      orderBy: { createdAt: 'desc', ...args.orderBy },
      omit: { ...args.omit, deletedAt: true },
    });
  }

  async getMission(args: Prisma.MissionFindUniqueArgs) {
    return await this.prisma.mission.findUnique({
      ...args,
      where: { ...args.where, deletedAt: null },
      include: {
        missionTasks: true,
        missionTags: { include: { tag: true } },
        ...args.include,
      },
      omit: { ...args.omit, deletedAt: true },
    });
  }

  async createMission(args: Prisma.MissionCreateArgs) {
    return await this.prisma.mission.create(args);
  }

  async updateMission(args: Prisma.MissionUpdateArgs) {
    return await this.prisma.mission.update(args);
  }

  async createMissionHistory(args: Prisma.MissionHistoryCreateArgs) {
    return await this.prisma.missionHistory.create(args);
  }

  async findTodayMissionHistories(accountId: number, todayStart: Date) {
    return this.prisma.missionHistory.findMany({
      where: {
        completed: true,
        createdAt: { gte: todayStart },

        mission: {
          accountId,
          deletedAt: null,
        },
      },
      select: {
        missionId: true,
      },
    });
  }
}
