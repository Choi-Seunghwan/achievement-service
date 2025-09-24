import { BadRequestException, Injectable } from '@nestjs/common';
import { AchievementParticipantRepository } from './achievement-participant.repository';
import { PublicAchievementParticipantResDto } from 'src/public-achievement/dtos/public-achievement-participant-res.dto';
import { AccountClientService } from 'src/account/account-client.service';

@Injectable()
export class AchievementParticipantService {
  constructor(
    private readonly achievementParticipantRepository: AchievementParticipantRepository,
    private readonly accountService: AccountClientService,
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

  async getPublicAchievementParticipantsWithPaging(
    publicAchievementId: number,
    paging: { page: number; size: number },
  ): Promise<{ total: number; items: PublicAchievementParticipantResDto[] }> {
    const { total, items } =
      await this.achievementParticipantRepository.getParticipantWithPaging(
        publicAchievementId,
        paging,
      );

    const accounts = await this.accountService.getUsersInfo(
      items.map((participant) => participant.accountId),
    );

    return {
      total,
      items: items.map((participant) => {
        const account = accounts.find((a) => a.id === participant.accountId);

        if (!account) {
          return {
            ...participant,
            account: null,
          };
        }

        return {
          ...participant,
          account: {
            id: account.id,
            nickname: account.nickname,
            email: account.email,
            image: account.image,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
          },
        };
      }),
    };
  }
}
