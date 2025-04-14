import { Injectable, NotFoundException } from '@nestjs/common';
import { MissionRepository } from './mission.repository';
import { MissionStatus } from '@prisma/client';

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
      return new NotFoundException(
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
}
