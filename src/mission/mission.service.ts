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
  MissionTaskStatus,
} from '@prisma/client';
import { MISSION_TASK_MAX_COUNT } from './constants/mission.constant';
import { weekdayMap } from './utils/weekdayMap';
import { startOfDay } from 'date-fns';
import { ActiveMissionsResponseDto } from './dto/active-missions-response.dto';
import { toMissionTaskView } from './utils/toMissionTaskView';
import { MissionView } from './view/mission-view';

@Injectable()
export class MissionService {
  constructor(private readonly missionRepository: MissionRepository) {}

  /**
   * 사용자 활성 미션 목록 가져오기
   */
  async getActiveMissions(
    accountId: number,
  ): Promise<ActiveMissionsResponseDto> {
    const todayStart = startOfDay(new Date());
    const todayWeekdayEnum = weekdayMap[todayStart.getDay()];

    // 오늘 기준 미션 조회
    const missions = await this.missionRepository.getMissions({
      where: {
        OR: [
          {
            accountId,
            status: MissionStatus.IN_PROGRESS,
          },
          {
            accountId,
            status: MissionStatus.COMPLETED,
            missionHistory: {
              some: {
                createdAt: { gte: todayStart },
              },
            },
          },
        ],
      },
    });

    // 오늘 히스토리 전체 가져오기 (최신 기록이 먼저)
    const todayHistories =
      await this.missionRepository.findTodayMissionHistories(
        accountId,
        todayStart,
      );

    // 오늘 완료 여부 매핑 missionId → completed
    const missionTodayMap = new Map<number, boolean>();
    const taskTodayMap = new Map<number, boolean>();

    for (const h of todayHistories) {
      if (h.taskId === null && !missionTodayMap.has(h.missionId)) {
        missionTodayMap.set(h.missionId, h.completed);
      } else if (h.taskId !== null && !taskTodayMap.has(h.taskId)) {
        taskTodayMap.set(h.taskId, h.completed);
      }
    }

    // MissionView 생성
    const missionViews: MissionView[] = missions.map((mission) => ({
      ...mission,
      missionTasks: mission.missionTasks.map((task) =>
        toMissionTaskView(task, taskTodayMap.get(task.id) ?? false),
      ),
      todayCompleted: missionTodayMap.get(mission.id) ?? false,
    }));

    // 분류
    const oneTimeMissions = missionViews.filter(
      (m) => m.repeatType === 'NONE' && !m.todayCompleted,
    );

    const todayMissions = missionViews.filter((m) => {
      const isDaily = m.repeatType === 'DAILY';
      const isWeekly = m.repeatType === 'WEEKLY';
      const isToday =
        isDaily || (isWeekly && m.repeatDays.includes(todayWeekdayEnum));
      return isToday && !m.todayCompleted;
    });

    const todayCompletedMissions = missionViews.filter(
      (m) => m.todayCompleted === true,
    );

    const upcomingMissions = missionViews.filter(
      (m) =>
        m.repeatType === 'WEEKLY' &&
        !m.repeatDays.includes(todayWeekdayEnum) &&
        !m.todayCompleted,
    );

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
   * 미션 완료, 반복 미션 오늘 완료
   */
  async completeMission(accountId: number, missionId: number) {
    const mission = await this.getMission(accountId, missionId);

    if (mission.status === MissionStatus.COMPLETED)
      throw new BadRequestException('already completed');

    switch (mission.repeatType) {
      case MissionRepeatType.NONE: {
        if (
          mission.missionTasks.length > 0 &&
          !mission.missionTasks.every(
            (task) => task.status === MissionTaskStatus.COMPLETED,
          )
        )
          throw new BadRequestException(
            `mission task not completed. taskId: ${mission.missionTasks[0].id}`,
          );

        await this.missionRepository.updateMission({
          where: { id: missionId, accountId },
          data: { status: MissionStatus.COMPLETED },
        });
        break;
      }
      case MissionRepeatType.WEEKLY:
        const todayWeekdayEnum = weekdayMap[startOfDay(new Date()).getDay()];

        if (!mission.repeatDays.includes(todayWeekdayEnum))
          throw new BadRequestException('today not repeat day');

      case MissionRepeatType.DAILY: {
        const histories =
          await this.missionRepository.findTodayMissionHistories(
            accountId,
            startOfDay(new Date()),
          );

        const missionHistory = histories.find(
          (history) =>
            history.missionId === mission.id && history.taskId === null,
        );

        if (missionHistory && missionHistory.completed)
          throw new BadRequestException('today already mission completed');

        if (mission.missionTasks.length > 0) {
          mission.missionTasks.map((task) => {
            const taskHistory = histories.find(
              (history) => history.taskId === task.id,
            );

            if (!taskHistory || !taskHistory.completed)
              throw new BadRequestException(
                `mission task not completed. taskId: ${task.id}`,
              );
          });
        }

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
  async createMissionTask(accountId: number, missionId: number) {
    const mission = await this.getMission(accountId, missionId);

    if (mission.missionTasks.length >= MISSION_TASK_MAX_COUNT)
      throw new BadRequestException(
        `max task count error, max: ${MISSION_TASK_MAX_COUNT}, current: ${mission.missionTasks.length}`,
      );

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

    if (
      task.status === MissionTaskStatus.COMPLETED ||
      mission.status === MissionStatus.COMPLETED
    )
      throw new BadRequestException('already completed');

    const todayHistories = await this.missionRepository.getMissionHistories({
      where: {
        missionId,
        taskId,
        createdAt: {
          gte: startOfDay(new Date()),
        },
      },
    });

    if (todayHistories?.[0]?.completed)
      throw new BadRequestException('today already completed');

    switch (mission.repeatType) {
      case MissionRepeatType.NONE: {
        await this.missionRepository.updateMissionTask(taskId, {
          status: MissionTaskStatus.COMPLETED,
        });
        break;
      }
      case MissionRepeatType.DAILY:
        break;

      case MissionRepeatType.WEEKLY: {
        const todayWeekdayEnum = weekdayMap[startOfDay(new Date()).getDay()];

        if (!mission.repeatDays.includes(todayWeekdayEnum))
          throw new BadRequestException('today not repeat day');
        break;
      }
    }

    await this.missionRepository.createMissionHistory({
      data: {
        completed: true,
        missionId,
        taskId,
        taskSnapshot: {
          id: task.id,
          name: task.name,
        },
      },
    });

    return true;
  }
}
