import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MissionRepository } from './mission.repository';
import { MissionStatus } from '@prisma/client';
import { MissionTask } from './types/mission.types';
import { MISSION_TASK_MAX_COUNT } from './constants/mission.constant';

@Injectable()
export class MissionService {
  constructor(private readonly missionRepository: MissionRepository) {}

  /**
   * 사용자 미션 목록 가져오기
   */
  async getMissionsWithPaging(
    args: { accountId: number; status?: MissionStatus },
    paging: { page: number; size: number },
  ) {
    return await this.missionRepository.getMissionsWithPaging(
      { where: { accountId: args.accountId, status: args.status } },
      paging,
    );
  }

  /**
   *  사용자 미션 가져오기
   */
  async getMission(accountId: number, missionId: number) {
    const mission = await this.missionRepository.getMission({
      where: { id: missionId, accountId },
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
    data: { name: string; description?: string },
  ) {
    await this.missionRepository.createMission({
      data: {
        accountId,
        name: data.name,
        description: data.description,
      },
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
    await this.missionRepository.updateMission({
      where: { id: missionId, accountId },
      data: { status: MissionStatus.COMPLETED },
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
    data: { name: string },
  ) {
    const mission = await this.getMission(accountId, missionId);

    if (mission.tasks.length >= MISSION_TASK_MAX_COUNT)
      throw new BadRequestException(
        `max task count error, max: ${MISSION_TASK_MAX_COUNT}, current: ${mission.tasks.length}`,
      );

    const newTaskId = Math.max(
      ...mission.tasks.map((task: MissionTask) => Number(task.id)),
    );

    const newTask = {
      id: newTaskId,
      name: data.name,
      complete: false,
    };

    await this.missionRepository.updateMission({
      where: {
        id: missionId,
        accountId,
        deletedAt: null,
      },
      data: {
        tasks: [...mission.tasks, newTask],
      },
    });

    return true;
  }

  /** 미션 Task 완료 */

  async completeMissionTask(
    accountId: number,
    missionId: number,
    taskId: number,
  ) {
    const mission = await this.getMission(accountId, missionId);

    const task = mission.tasks.find((task: MissionTask) => task.id === taskId);

    if (!task) throw new NotFoundException('task not found');

    const newTasks = mission.tasks.map((task: MissionTask) => {
      if (task.id === taskId) {
        return {
          ...task,
          complete: true,
        };
      }
      return task;
    });

    await this.missionRepository.updateMission({
      where: {
        id: missionId,
        accountId,
        deletedAt: null,
      },
      data: {
        tasks: newTasks,
      },
    });

    return true;
  }
}
