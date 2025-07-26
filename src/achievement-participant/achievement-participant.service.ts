import { BadRequestException, Injectable } from '@nestjs/common';
import { AchievementParticipantRepository } from './achievement-participant.repository';

@Injectable()
export class AchievementParticipantService {
  constructor(
    private readonly achievementParticipantRepository: AchievementParticipantRepository,
  ) {}

  async getMyParticipatingAchievements(accountId: number) {
    return await this.achievementParticipantRepository.getUserParticipatingAchievements(
      accountId,
    );
  }

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
