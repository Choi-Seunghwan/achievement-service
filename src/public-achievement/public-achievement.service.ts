import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PublicAchievementRepository } from './public-achievement.repository';
import { Transactional } from '@nestjs-cls/transactional';
import { MissionService } from 'src/mission/mission.service';
import { PublicMissionTaskService } from 'src/public-mission-task/public-mission-task.service';
import { AchievementService } from 'src/achievement/achievement.service';
import { PublicAchievementCommentRepository } from './public-achievement-comment.repository.';
import { AccountClientService } from 'src/account/account-client.service';
import { PublicAchievementCommentResDto } from './dtos/public-achievement-comment-res.dto';
import { AchievementParticipantService } from 'src/achievement-participant/achievement-participant.service';
import { PublicAchievementResDto } from './dtos/public-achievement-res.dto';
import toPublicAchievementResDto from './utils/toPublicAchievementResDto';

@Injectable()
export class PublicAchievementService {
  constructor(
    private readonly publicAchievementRepository: PublicAchievementRepository,
    private readonly publicAchievementCommentRepository: PublicAchievementCommentRepository,
    private readonly publicMissionTaskService: PublicMissionTaskService,
    private readonly achievementService: AchievementService,
    private readonly missionService: MissionService,
    private readonly accountService: AccountClientService,
    private readonly achievementParticipantService: AchievementParticipantService,
  ) {}

  @Transactional()
  async createPublicAchievement(
    accountId: number,
    data: {
      name: string;
      description: string;
      icon: string;
      missionIds: number[];
    },
  ) {
    const missions = await this.missionService.getMissions(
      accountId,
      data.missionIds,
    );

    if (missions.some((m) => m.publicMissionId)) {
      throw new BadRequestException(
        'Some missions are already connected with a public missions.',
      );
    }

    // 공개 미션 데이터 생성
    const publicMissionData = missions.map((mission) => ({
      name: mission.name,
      icon: mission.icon,
      repeatType: mission.repeatType,
      repeatDays: mission.repeatDays,
      description: mission.description,
    }));

    const publicAchievement =
      await this.publicAchievementRepository.createPublicAchievement({
        creatorId: accountId,
        name: data.name,
        description: data.description,
        icon: data.icon,
        // 공개 미션 생성
        missions: {
          createMany: {
            data: publicMissionData,
          },
        },
        // 참여자 생성
        participants: {
          create: {
            accountId,
            jointedAt: new Date(),
          },
        },
      });

    const publicMissions = publicAchievement.missions;

    await Promise.all(
      publicMissions.map((publicMission, i) => {
        const originalMission = missions[i];

        if (!originalMission.missionTasks?.length) return Promise.resolve();

        return this.publicMissionTaskService.createPublicMissionTasks(
          publicMission.id,
          originalMission.missionTasks.map((task) => ({ name: task.name })),
        );
      }),
    );

    // 유저 개인 업적 생성
    const achievement =
      await this.achievementService.createAchievementWithPublicData(accountId, {
        name: publicAchievement.name,
        description: publicAchievement.description,
        icon: publicAchievement.icon,
        publicAchievementId: publicAchievement.id,
      });

    // 미션, 공개 미션 매핑. 반드시 index 순서가 맞아야 함
    const missionMap = missions.reduce(
      (acc, mission, i) => {
        acc[mission.id] = publicMissions[i].id;
        return acc;
      },
      {} as Record<number, number>,
    );

    // 공개 미션과 유저 미션 연결
    await this.missionService.connectMissionsWithPublicData(
      accountId,
      achievement.id,
      missionMap,
    );
  }

  async getPublicAchievements(
    accountId: number,
    paging: { page: number; size: number },
    keyword?: string,
  ): Promise<{
    items: PublicAchievementResDto[];
    total: number;
  }> {
    const whereArg = {
      name: {
        contains: keyword,
      },
    };

    const result = await this.publicAchievementRepository.getPublicAchievements(
      {
        where: whereArg,
      },
      paging,
    );

    const userParticipatingAchievements =
      await this.achievementParticipantService.getUserParticipating(
        accountId,
        result.items.map((item) => item.id),
      );

    const userParticipatingAchievementIds = new Set(
      userParticipatingAchievements.map((p) => p.publicAchievementId),
    );

    const resItems = result.items.map((item) =>
      toPublicAchievementResDto(
        item,
        userParticipatingAchievementIds.has(item.id),
      ),
    );

    return {
      ...result,
      items: resItems,
    };
  }

  async getPopularPublicAchievements() {
    return await this.publicAchievementRepository.getPublicAchievements(
      {
        orderBy: [
          {
            participants: { _count: 'desc' },
          },
          {
            createdAt: 'desc',
          },
        ],
      },
      { page: 1, size: 10 },
    );
  }

  async getPublicAchievement(accountId: number, id: number) {
    const publicAchievement =
      await this.publicAchievementRepository.getPublicAchievement({
        where: { id },
      });

    if (!publicAchievement) {
      throw new NotFoundException('Public Achievement not found');
    }

    return publicAchievement;
  }

  async getPublicAchievementComments(
    id: number,
    { page, size }: { page: number; size: number },
  ): Promise<PublicAchievementCommentResDto[]> {
    const comments =
      await this.publicAchievementCommentRepository.getPublicAchievementCommentsWithPaging(
        {
          where: { publicAchievementId: id },
        },
        { page, size },
      );

    const accounts = await this.accountService.getUsersInfo(
      comments.map((c) => c.accountId),
    );

    return comments.map((c) => {
      const account = accounts.find((a) => a.id === c.accountId) || null;

      return {
        id: c.id,
        publicAchievementId: c.publicAchievementId,
        accountId: c.accountId,
        account,
        comment: c.comment,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });
  }

  async createPublicAchievementComment(
    accountId: number,
    publicAchievementId: number,
    data: { comment: string },
  ) {
    const publicAchievement =
      await this.publicAchievementRepository.getPublicAchievement({
        where: { id: publicAchievementId },
      });

    if (!publicAchievement)
      throw new NotFoundException('Public Achievement not found');

    await this.publicAchievementCommentRepository.createPublicAchievementComment(
      {
        accountId,
        publicAchievement: {
          connect: { id: publicAchievementId },
        },
        comment: data.comment,
      },
    );
  }

  async joinPublicAchievement(accountId: number, publicAchievementId: number) {
    const publicAchievement =
      await this.publicAchievementRepository.getPublicAchievement({
        where: { id: publicAchievementId },
      });

    if (!publicAchievement) {
      throw new NotFoundException('Public Achievement not found');
    }

    const existingParticipant =
      await this.achievementParticipantService.getParticipant(
        accountId,
        publicAchievementId,
      );

    if (existingParticipant) {
      throw new BadRequestException('Already joined this public achievement');
    }

    await this.missionService.createMissionsWithPublicData(
      accountId,
      publicAchievement.missions.map((m) => ({
        publicMissionId: m.id,
        name: m.name,
        icon: m.icon,
        repeatType: m.repeatType,
        repeatDays: m.repeatDays,
        description: m.description,
      })),
    );

    await this.achievementService.createAchievementWithPublicData(accountId, {
      name: publicAchievement.name,
      description: publicAchievement.description,
      icon: publicAchievement.icon,
      publicAchievementId: publicAchievement.id,
    });

    await this.achievementParticipantService.joinPublicAchievement(
      accountId,
      publicAchievementId,
    );

    return true;
  }

  async leavePublicAchievement(accountId: number, publicAchievementId: number) {
    const publicAchievement =
      await this.publicAchievementRepository.getPublicAchievement({
        where: { id: publicAchievementId },
      });

    if (!publicAchievement) {
      throw new NotFoundException('Public Achievement not found');
    }

    const existingParticipant =
      await this.achievementParticipantService.getParticipant(
        accountId,
        publicAchievementId,
      );

    if (!existingParticipant) {
      throw new BadRequestException('Not a participant of this achievement');
    }

    await this.achievementParticipantService.leavePublicAchievement(
      accountId,
      publicAchievementId,
    );

    return true;
  }
}
