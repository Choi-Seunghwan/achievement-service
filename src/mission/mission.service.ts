import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MissionRepository } from './mission.repository';
import {
  MissionRepeatDay,
  MissionRepeatType,
  MissionStatus,
} from '@prisma/client';
import { MISSION_TASK_MAX_COUNT } from './constants/mission.constant';
import { weekdayMap } from './utils/weekdayMap';

@Injectable()
export class MissionService {
  constructor(private readonly missionRepository: MissionRepository) {}

  /**
   * 사용자 활성 미션 목록 가져오기
   */
  async getActiveMissions(accountId: number) {
    const missions = await this.missionRepository.getMissions({
      where: { accountId, status: MissionStatus.IN_PROGRESS },
    });

    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayWeekdayEnum = weekdayMap[today.getDay()];

    const todayHistories =
      await this.missionRepository.findTodayMissionHistories(
        accountId,
        todayStart,
      );

    const todayMissions = [];
    const todayCompletedMissions = [];
    const upcomingMissions = [];
    const oneTimeMissions = [];

    for (const mission of missions) {
      const isCompletedToday = todayHistories.some(
        (h) => h.missionId === mission.id,
      );

      const isDaily = mission.repeatType === MissionRepeatType.DAILY;
      const isWeekly = mission.repeatType === MissionRepeatType.WEEKLY;
      const isNone = mission.repeatType === MissionRepeatType.NONE;

      const isTodayMission =
        isDaily || (isWeekly && mission.repeatDays.includes(todayWeekdayEnum));

      const isUpcoming =
        isWeekly && !mission.repeatDays.includes(todayWeekdayEnum);

      if (isNone) oneTimeMissions.push({ ...mission });
      else if (isTodayMission && !isCompletedToday)
        todayMissions.push({ ...mission });
      else if (isTodayMission && isCompletedToday)
        todayCompletedMissions.push({ ...mission });
      else if (isUpcoming) upcomingMissions.push({ ...mission });
    }

    return {
      oneTimeMissions,
      todayMissions,
      todayCompletedMissions,
      upcomingMissions,
    };
  }

  /**
   * 사용자 미션 목록 가져오기
   */
  async getMissionsWithPaging(
    args: { accountId: number; status?: MissionStatus },
    paging: { page: number; size: number },
  ) {
    return await this.missionRepository.getMissionsWithPaging(
      {
        where: { accountId: args.accountId, status: args.status },
        include: {
          missionTasks: true,
          missionTags: { include: { tag: true } },
        },
      },
      paging,
    );
  }

  /**
   *  사용자 미션 가져오기
   */
  async getMission(accountId: number, missionId: number) {
    const mission = await this.missionRepository.getMission({
      where: { id: missionId, accountId },
      include: {
        missionTasks: true,
      },
    });

    if (!mission)
      throw new NotFoundException(
        `mission not found (accountId: ${accountId}, missionId: ${missionId})`,
      );

    return mission;
  }

  /**
   * 미션 생성
   */
  async createMission(
    accountId: number,
    data: {
      name: string;
      description?: string;
      icon?: string;
      tasks?: { name: string }[];
      tagIds?: number[];
      repeatType?: MissionRepeatType;
      repeatDays?: MissionRepeatDay[];
    },
  ) {
    await this.missionRepository.createMission({
      data: {
        accountId,
        name: data.name,
        description: data.description,
        repeatType: data.repeatType,
        repeatDays: data.repeatDays,
        icon: data.icon,
        ...(data.tasks?.length
          ? {
              missionTasks: {
                createMany: {
                  data: data.tasks.map((task) => ({ name: task.name })),
                },
              },
            }
          : {}),
        ...(data.tagIds?.length
          ? {
              missionTags: {
                createMany: {
                  data: data.tagIds.map((tagId) => ({ tagId })),
                },
              },
            }
          : {}),
      },
    });

    return true;
  }

  /**
   * 반복 미션 종결(완료)
   */
  async completeRecurringMission(accountId: number, missionId: number) {
    const mission = await this.getMission(accountId, missionId);

    if (mission.repeatType === MissionRepeatType.NONE) {
      throw new BadRequestException('cannot complete recurring mission');
    }

    if (mission.status === MissionStatus.COMPLETED) {
      throw new BadRequestException('already completed');
    }

    await this.missionRepository.updateMission({
      where: { id: missionId, accountId },
      data: { status: MissionStatus.COMPLETED },
    });

    return true;
  }

  /**
   * 미션 수정
   */
  async updateMission(
    accountId: number,
    missionId: number,
    data: { name?: string; description?: string },
  ) {
    await this.getMission(accountId, missionId);

    await this.missionRepository.updateMission({
      where: { id: missionId, accountId },
      data,
    });
  }

  /**
   * 미션 완료
   */
  async completeMission(accountId: number, missionId: number) {
    const mission = await this.getMission(accountId, missionId);

    if (mission.status === MissionStatus.COMPLETED)
      throw new BadRequestException('already completed');

    switch (mission.repeatType) {
      case MissionRepeatType.NONE: {
        await this.missionRepository.updateMission({
          where: { id: missionId, accountId },
          data: { status: MissionStatus.COMPLETED },
        });
        break;
      }
      case MissionRepeatType.DAILY:
      case MissionRepeatType.WEEKLY: {
        break;
      }
    }

    await this.missionRepository.createMissionHistory({
      data: {
        completed: true,
        missionId,
      },
    });

    return true;
  }

  /**
   * 미션 삭제
   */
  async deleteMission(accountId: number, missionId: number) {
    await this.missionRepository.updateMission({
      where: { id: missionId, accountId },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  /**
   * 미션 Task 생성
   */
  async createMissionTask(
    accountId: number,
    missionId: number,
    // data: { name: string },
  ) {
    const mission = await this.getMission(accountId, missionId);

    if (mission.missionTasks.length >= MISSION_TASK_MAX_COUNT)
      throw new BadRequestException(
        `max task count error, max: ${MISSION_TASK_MAX_COUNT}, current: ${mission.missionTasks.length}`,
      );

    // const newTaskId = Math.max(
    //   ...mission.missionTasks.map((task) => Number(task.id)),
    // );

    // const newTask = {
    //   id: newTaskId,
    //   name: data.name,
    //   complete: false,
    // };

    // await this.missionRepository.updateMission({
    //   where: {
    //     id: missionId,
    //     accountId,
    //     deletedAt: null,
    //   },
    //   data: {
    //     missionTasks: [...mission.missionTasks, newTask],
    //   },
    // });

    return true;
  }

  /** 미션 Task 완료 */

  async completeMissionTask(
    accountId: number,
    missionId: number,
    taskId: number,
  ) {
    const mission = await this.getMission(accountId, missionId);

    const task = mission.missionTasks.find((task) => task.id === taskId);

    if (!task) throw new NotFoundException('task not found');

    // const newTasks = mission.missionTasks.map((task) => {
    //   if (task.id === taskId) {
    //     return {
    //       ...task,
    //       complete: true,
    //     };
    //   }
    //   return task;
    // });

    await this.missionRepository.updateMission({
      where: {
        id: missionId,
        accountId,
        deletedAt: null,
      },
      data: {
        // missionTasks: newTasks,
      },
    });

    return true;
  }
}
