import { Injectable } from '@nestjs/common';
import { MissionStatus, Prisma } from '@prisma/client';
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
        missionTasks: {
          orderBy: {
            id: 'asc',
          },
          where: {
            deletedAt: null,
          },
        },
        missionTags: {
          include: { tag: true },
          where: {
            deletedAt: null,
          },
        },
        achievement: { where: { deletedAt: null } },
        publicMission: { where: { deletedAt: null } },
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
        ...args.include,
        missionTasks: {
          where: { deletedAt: null },
        },
        missionTags: { include: { tag: true }, where: { deletedAt: null } },
        achievement: { where: { deletedAt: null } },
      },
      omit: { ...args.omit, deletedAt: true },
    });
  }

  async createMission(args: Prisma.MissionCreateArgs) {
    return await this.prisma.mission.create(args);
  }

  async createMissions(args: Prisma.MissionCreateManyArgs) {
    return await this.prisma.mission.createMany({
      ...args,
    });
  }

  async updateMission(args: Prisma.MissionUpdateArgs) {
    return await this.prisma.mission.update({
      ...args,
      where: { ...args.where, deletedAt: null },
    });
  }

  async createMissionHistory(args: Prisma.MissionHistoryCreateArgs) {
    return await this.prisma.missionHistory.create(args);
  }

  async findTodayMissionsHistories(accountId: number, todayStart: Date) {
    return this.prisma.missionHistory.findMany({
      where: {
        mission: {
          accountId,
          deletedAt: null,
        },
        createdAt: { gte: todayStart },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTodayMissionsHistoriesByMission(
    accountId: number,
    missionId: number,
    todayStart: Date,
  ) {
    return this.prisma.missionHistory.findMany({
      where: {
        missionId,
        mission: {
          accountId,
          deletedAt: null,
        },
        createdAt: { gte: todayStart },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMissionHistories(args: Prisma.MissionHistoryFindManyArgs) {
    return await this.prisma.missionHistory.findMany({
      ...args,
      where: { ...args.where },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMissionHistory(args: Prisma.MissionHistoryFindFirstArgs) {
    return await this.prisma.missionHistory.findFirst(args);
  }

  async updateMissionTask(
    missionId: number,
    taskId: number,
    data: Prisma.MissionTaskUpdateInput,
  ) {
    return await this.prisma.missionTask.update({
      where: { id: taskId, deletedAt: null },
      data,
    });
  }

  async createMissionTask(args: Prisma.MissionTaskCreateArgs) {
    return await this.prisma.missionTask.create(args);
  }

  async updateMissions(args: Prisma.MissionUpdateManyArgs) {
    return await this.prisma.mission.updateMany({
      ...args,
      where: { ...args.where, deletedAt: null },
    });
  }
  async getMissionCount(accountId: number) {
    const [inProgressCount, completedCount] = await Promise.all([
      this.prisma.mission.count({
        where: {
          accountId,
          status: MissionStatus.IN_PROGRESS,
          deletedAt: null,
        },
      }),
      this.prisma.mission.count({
        where: {
          accountId,
          status: MissionStatus.COMPLETED,
          deletedAt: null,
        },
      }),
    ]);

    return {
      inProgressCount,
      completedCount,
    };
  }
}
