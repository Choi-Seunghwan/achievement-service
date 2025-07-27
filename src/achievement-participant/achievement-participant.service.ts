import { BadRequestException, Injectable } from '@nestjs/common';
import { AchievementParticipantRepository } from './achievement-participant.repository';

@Injectable()
export class AchievementParticipantService {
  constructor(
    private readonly achievementParticipantRepository: AchievementParticipantRepository,
  ) {}

  // 내가 참여 중인 공개 업적 목록 조회
  async getMyParticipatingAchievements(accountId: number) {
    return await this.achievementParticipantRepository.getUserParticipatingAchievements(
      accountId,
    );
  }

  // 공개 업적들 참여 확인
  async getUserParticipating(
    accountId: number,
    publicAchievementIds: number[],
  ) {
    const participants =
      await this.achievementParticipantRepository.getUserParticipating(
        accountId,
        publicAchievementIds,
      );

    return participants;
  }

  // 공개 업적 참여
  async joinPublicAchievement(accountId: number, achievementId: number) {
    const existing =
      await this.achievementParticipantRepository.getPublicParticipant(
        accountId,
        achievementId,
      );

    if (existing && !existing.leavedAt)
      throw new BadRequestException('Already joined');

    await this.achievementParticipantRepository.create(
      accountId,
      achievementId,
    );
  }

  async leavePublicAchievement(accountId: number, achievementId: number) {
    const existing =
      await this.achievementParticipantRepository.getPublicParticipant(
        accountId,
        achievementId,
      );

    if (!existing || existing.leavedAt)
      throw new BadRequestException('Not joined');

    await this.achievementParticipantRepository.updateLeavedAt(
      existing.id,
      accountId,
      achievementId,
    );
  }

  async getParticipant(accountId: number, publicAchievementId: number) {
    const participant =
      await this.achievementParticipantRepository.getPublicParticipant(
        accountId,
        publicAchievementId,
      );

    return participant;
  }
}
