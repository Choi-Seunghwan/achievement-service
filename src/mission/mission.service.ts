import { Injectable } from '@nestjs/common';
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
   * 미션 생성
   */
  async createMission(
    accountId: number,
    data: { name: string; description?: string },
  ) {
    return await this.missionRepository.createMission({
      data: {
        accountId,
        name: data.name,
        description: data.description,
      },
    });
  }
}
