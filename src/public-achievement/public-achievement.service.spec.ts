import { Test, TestingModule } from '@nestjs/testing';
import { PublicAchievementService } from './public-achievement.service';
import { PublicAchievementRepository } from './public-achievement.repository';
import { PublicAchievementCommentRepository } from './public-achievement-comment.repository.';
import { PublicMissionTaskService } from 'src/public-mission-task/public-mission-task.service';
import { AchievementService } from 'src/achievement/achievement.service';
import { MissionService } from 'src/mission/mission.service';
import { AccountService } from 'src/account/account.service';
import { AchievementParticipantService } from 'src/achievement-participant/achievement-participant.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';

describe('PublicAchievementService', () => {
  let service: PublicAchievementService;
  let publicAchievementRepository: jest.Mocked<PublicAchievementRepository>;
  let achievementService: jest.Mocked<AchievementService>;
  let missionService: jest.Mocked<MissionService>;
  let achievementParticipantService: jest.Mocked<AchievementParticipantService>;

  // 테스트용 공개 업적 데이터
  const mockPublicAchievement = {
    id: 1,
    name: '테스트 공개 업적',
    description: '테스트 설명',
    icon: '🏆',
    creatorId: 1,
    category: 'HEALTH',
    startDate: null,
    endDate: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    missions: [
      {
        id: 10,
        name: '테스트 미션 1',
        icon: '🎯',
        repeatType: 'NONE',
        repeatDays: [],
        description: '미션 설명',
        tasks: [{ id: 100, name: '태스크 1' }],
      },
    ],
    _count: { participants: 5 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicAchievementService,
        {
          provide: PublicAchievementRepository,
          useValue: {
            createPublicAchievement: jest.fn(),
            getPublicAchievements: jest.fn(),
            getPublicAchievement: jest.fn(),
          },
        },
        {
          provide: PublicAchievementCommentRepository,
          useValue: {
            getPublicAchievementCommentsWithPaging: jest.fn(),
            createPublicAchievementComment: jest.fn(),
          },
        },
        {
          provide: PublicMissionTaskService,
          useValue: {
            createPublicMissionTasks: jest.fn(),
          },
        },
        {
          provide: AchievementService,
          useValue: {
            createAchievementWithPublicData: jest.fn(),
            deleteAchievementByPublicAchievementId: jest.fn(),
          },
        },
        {
          provide: MissionService,
          useValue: {
            getMissions: jest.fn(),
            createMissionsWithPublicData: jest.fn(),
            connectMissionsWithPublicData: jest.fn(),
          },
        },
        {
          provide: AccountService,
          useValue: {
            getAccounts: jest.fn(),
          },
        },
        {
          provide: AchievementParticipantService,
          useValue: {
            getUserParticipating: jest.fn(),
            getParticipant: jest.fn(),
            joinPublicAchievement: jest.fn(),
            leavePublicAchievement: jest.fn(),
            getPublicAchievementParticipantsWithPaging: jest.fn(),
          },
        },
        {
          provide: TransactionHost,
          useValue: {
            tx: {},
            withTransaction: jest.fn((...args) => {
              const fn = args[args.length - 1];
              return typeof fn === 'function' ? fn() : undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PublicAchievementService>(PublicAchievementService);
    publicAchievementRepository = module.get(PublicAchievementRepository);
    achievementService = module.get(AchievementService);
    missionService = module.get(MissionService);
    achievementParticipantService = module.get(AchievementParticipantService);
  });

  it('서비스가 정의되어 있어야 한다', () => {
    expect(service).toBeDefined();
  });

  describe('joinPublicAchievement', () => {
    const accountId = 1;
    const publicAchievementId = 1;

    it('성공적으로 공개 업적에 참여해야 한다', async () => {
      // 공개 업적이 존재
      publicAchievementRepository.getPublicAchievement.mockResolvedValue(
        mockPublicAchievement as any,
      );
      // 아직 참여하지 않은 상태
      achievementParticipantService.getParticipant.mockResolvedValue(null);
      // 업적 생성 성공
      achievementService.createAchievementWithPublicData.mockResolvedValue({
        id: 100,
        name: mockPublicAchievement.name,
      } as any);
      // 미션 생성 성공
      missionService.createMissionsWithPublicData.mockResolvedValue(true);
      // 참여자 등록 성공
      achievementParticipantService.joinPublicAchievement.mockResolvedValue(
        undefined,
      );

      const result = await service.joinPublicAchievement(
        accountId,
        publicAchievementId,
      );

      expect(result).toBe(true);
      expect(
        achievementService.createAchievementWithPublicData,
      ).toHaveBeenCalledWith(accountId, {
        name: mockPublicAchievement.name,
        description: mockPublicAchievement.description,
        icon: mockPublicAchievement.icon,
        publicAchievementId: mockPublicAchievement.id,
      });
      expect(missionService.createMissionsWithPublicData).toHaveBeenCalled();
      expect(
        achievementParticipantService.joinPublicAchievement,
      ).toHaveBeenCalledWith(accountId, publicAchievementId);
    });

    it('이미 참여한 경우 BadRequestException을 던져야 한다', async () => {
      publicAchievementRepository.getPublicAchievement.mockResolvedValue(
        mockPublicAchievement as any,
      );
      // 이미 참여 중인 상태
      achievementParticipantService.getParticipant.mockResolvedValue({
        id: 1,
        accountId,
        publicAchievementId,
        jointedAt: new Date(),
        leavedAt: null,
      } as any);

      await expect(
        service.joinPublicAchievement(accountId, publicAchievementId),
      ).rejects.toThrow(BadRequestException);
    });

    it('존재하지 않는 공개 업적인 경우 NotFoundException을 던져야 한다', async () => {
      publicAchievementRepository.getPublicAchievement.mockResolvedValue(null);

      await expect(
        service.joinPublicAchievement(accountId, 999),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('leavePublicAchievement', () => {
    const accountId = 1;
    const publicAchievementId = 1;

    it('성공적으로 공개 업적에서 탈퇴해야 한다', async () => {
      publicAchievementRepository.getPublicAchievement.mockResolvedValue(
        mockPublicAchievement as any,
      );
      // 참여 중인 상태
      achievementParticipantService.getParticipant.mockResolvedValue({
        id: 1,
        accountId,
        publicAchievementId,
        jointedAt: new Date(),
        leavedAt: null,
      } as any);
      achievementService.deleteAchievementByPublicAchievementId.mockResolvedValue(
        true,
      );
      achievementParticipantService.leavePublicAchievement.mockResolvedValue(
        undefined,
      );

      const result = await service.leavePublicAchievement(
        accountId,
        publicAchievementId,
      );

      expect(result).toBe(true);
      expect(
        achievementService.deleteAchievementByPublicAchievementId,
      ).toHaveBeenCalledWith(accountId, publicAchievementId);
      expect(
        achievementParticipantService.leavePublicAchievement,
      ).toHaveBeenCalledWith(accountId, publicAchievementId);
    });

    it('참여하지 않은 경우 BadRequestException을 던져야 한다', async () => {
      publicAchievementRepository.getPublicAchievement.mockResolvedValue(
        mockPublicAchievement as any,
      );
      achievementParticipantService.getParticipant.mockResolvedValue(null);

      await expect(
        service.leavePublicAchievement(accountId, publicAchievementId),
      ).rejects.toThrow(BadRequestException);
    });

    it('존재하지 않는 공개 업적인 경우 NotFoundException을 던져야 한다', async () => {
      publicAchievementRepository.getPublicAchievement.mockResolvedValue(null);

      await expect(
        service.leavePublicAchievement(accountId, 999),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPublicAchievements', () => {
    const accountId = 1;
    const paging = { page: 1, size: 10 };

    it('카테고리 필터가 적용된 공개 업적 목록을 반환해야 한다', async () => {
      const category = 'HEALTH';
      const mockItems = [mockPublicAchievement];

      publicAchievementRepository.getPublicAchievements.mockResolvedValue({
        items: mockItems as any,
        total: 1,
      });
      achievementParticipantService.getUserParticipating.mockResolvedValue([]);

      const result = await service.getPublicAchievements(
        accountId,
        paging,
        undefined,
        category,
      );

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      // 카테고리 필터가 포함된 where 조건으로 호출되었는지 확인
      expect(
        publicAchievementRepository.getPublicAchievements,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category }),
        }),
        paging,
      );
    });

    it('카테고리 필터 없이 전체 목록을 반환해야 한다', async () => {
      publicAchievementRepository.getPublicAchievements.mockResolvedValue({
        items: [mockPublicAchievement] as any,
        total: 1,
      });
      achievementParticipantService.getUserParticipating.mockResolvedValue([]);

      const result = await service.getPublicAchievements(accountId, paging);

      expect(result.items).toHaveLength(1);
      // where 조건에 category가 없어야 함
      const callArgs =
        publicAchievementRepository.getPublicAchievements.mock.calls[0][0];
      expect(callArgs.where.category).toBeUndefined();
    });

    it('참여 중인 업적에 isParticipating이 true로 설정되어야 한다', async () => {
      publicAchievementRepository.getPublicAchievements.mockResolvedValue({
        items: [mockPublicAchievement] as any,
        total: 1,
      });
      // 사용자가 해당 업적에 참여 중
      achievementParticipantService.getUserParticipating.mockResolvedValue([
        { publicAchievementId: mockPublicAchievement.id } as any,
      ]);

      const result = await service.getPublicAchievements(accountId, paging);

      expect(result.items[0].isParticipating).toBe(true);
    });
  });

  describe('getSeasonalPublicAchievements', () => {
    const accountId = 1;
    const paging = { page: 1, size: 10 };

    it('시즌 공개 업적 목록을 종료일 임박순으로 반환해야 한다', async () => {
      const seasonalAchievement = {
        ...mockPublicAchievement,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      };

      publicAchievementRepository.getPublicAchievements.mockResolvedValue({
        items: [seasonalAchievement] as any,
        total: 1,
      });
      achievementParticipantService.getUserParticipating.mockResolvedValue([]);

      const result = await service.getSeasonalPublicAchievements(
        accountId,
        paging,
      );

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      // endDate 오름차순 정렬 조건으로 호출되었는지 확인
      expect(
        publicAchievementRepository.getPublicAchievements,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startDate: { not: null },
            endDate: expect.objectContaining({ not: null }),
          }),
          orderBy: { endDate: 'asc' },
        }),
        paging,
      );
    });

    it('시즌 업적이 없을 때 빈 목록을 반환해야 한다', async () => {
      publicAchievementRepository.getPublicAchievements.mockResolvedValue({
        items: [],
        total: 0,
      });
      achievementParticipantService.getUserParticipating.mockResolvedValue([]);

      const result = await service.getSeasonalPublicAchievements(
        accountId,
        paging,
      );

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});
