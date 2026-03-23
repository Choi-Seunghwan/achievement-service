import { Test, TestingModule } from '@nestjs/testing';
import { AchievementService } from './achievement.service';
import { AchievementRepository } from './achievement.repository';
import { MissionService } from 'src/mission/mission.service';
import { BadRequestException } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';

describe('AchievementService', () => {
  let service: AchievementService;
  let achievementRepository: jest.Mocked<AchievementRepository>;
  let missionService: jest.Mocked<MissionService>;

  // 테스트용 업적 데이터
  const mockAchievement = {
    id: 1,
    accountId: 1,
    name: '테스트 업적',
    description: '업적 설명',
    icon: '🏆',
    status: 'IN_PROGRESS',
    completedAt: null,
    publicAchievementId: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    missions: [],
    publicAchievement: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementService,
        {
          provide: AchievementRepository,
          useValue: {
            createAchievement: jest.fn(),
            getUserAchievement: jest.fn(),
            getUserActiveAchievements: jest.fn(),
            getUserAchievementsWithPaging: jest.fn(),
            getWithMissions: jest.fn(),
            update: jest.fn(),
            updateAchievement: jest.fn(),
            getCompletedAchievements: jest.fn(),
            getAchievementCount: jest.fn(),
          },
        },
        {
          provide: MissionService,
          useValue: {
            disconnectAchievement: jest.fn(),
            completeMissionWithHistory: jest.fn(),
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

    service = module.get<AchievementService>(AchievementService);
    achievementRepository = module.get(AchievementRepository);
    missionService = module.get(MissionService);
  });

  it('서비스가 정의되어 있어야 한다', () => {
    expect(service).toBeDefined();
  });

  describe('completeAchievement', () => {
    const accountId = 1;
    const achievementId = 1;

    it('모든 미션이 완료된 업적을 달성해야 한다', async () => {
      const achievementWithCompletedMissions = {
        ...mockAchievement,
        missions: [
          {
            id: 10,
            status: 'COMPLETED',
            missionHistories: [],
          },
          {
            id: 11,
            status: 'COMPLETED',
            missionHistories: [],
          },
        ],
      };

      achievementRepository.getUserAchievement.mockResolvedValue(
        achievementWithCompletedMissions as any,
      );
      achievementRepository.updateAchievement.mockResolvedValue(undefined);

      const result = await service.completeAchievement(
        accountId,
        achievementId,
      );

      expect(result).toBe(true);
      expect(achievementRepository.updateAchievement).toHaveBeenCalledWith(
        achievementId,
        expect.objectContaining({
          status: 'COMPLETED',
          completedAt: expect.any(Date),
        }),
      );
    });

    it('오늘 히스토리로 완료된 미션도 포함하여 업적을 달성해야 한다', async () => {
      const achievementWithMixedMissions = {
        ...mockAchievement,
        missions: [
          {
            id: 10,
            status: 'COMPLETED',
            missionHistories: [],
          },
          {
            id: 11,
            status: 'IN_PROGRESS',
            // 오늘 히스토리에서 완료된 미션
            missionHistories: [{ completed: true }],
          },
        ],
      };

      achievementRepository.getUserAchievement.mockResolvedValue(
        achievementWithMixedMissions as any,
      );
      achievementRepository.updateAchievement.mockResolvedValue(undefined);
      missionService.completeMissionWithHistory.mockResolvedValue(true);

      const result = await service.completeAchievement(
        accountId,
        achievementId,
      );

      expect(result).toBe(true);
      // IN_PROGRESS 미션도 completeMissionWithHistory로 완료 처리해야 함
      expect(missionService.completeMissionWithHistory).toHaveBeenCalledWith(
        accountId,
        11,
      );
    });

    it('미완료 미션이 있는 경우 BadRequestException을 던져야 한다', async () => {
      const achievementWithIncompleteMissions = {
        ...mockAchievement,
        missions: [
          {
            id: 10,
            status: 'COMPLETED',
            missionHistories: [],
          },
          {
            id: 11,
            status: 'IN_PROGRESS',
            // 오늘 완료 히스토리 없음
            missionHistories: [],
          },
        ],
      };

      achievementRepository.getUserAchievement.mockResolvedValue(
        achievementWithIncompleteMissions as any,
      );

      await expect(
        service.completeAchievement(accountId, achievementId),
      ).rejects.toThrow(BadRequestException);
    });

    it('업적을 찾을 수 없는 경우 BadRequestException을 던져야 한다', async () => {
      achievementRepository.getUserAchievement.mockResolvedValue(null);

      await expect(
        service.completeAchievement(accountId, 999),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createAchievementWithPublicData', () => {
    const accountId = 1;

    it('공개 업적 데이터로 개인 업적을 생성해야 한다', async () => {
      const publicData = {
        name: '공개 업적 이름',
        description: '공개 업적 설명',
        icon: '🌟',
        publicAchievementId: 100,
      };

      const createdAchievement = {
        id: 50,
        accountId,
        ...publicData,
        status: 'IN_PROGRESS',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      achievementRepository.createAchievement.mockResolvedValue(
        createdAchievement as any,
      );

      const result = await service.createAchievementWithPublicData(
        accountId,
        publicData,
      );

      expect(result).toEqual(createdAchievement);
      expect(achievementRepository.createAchievement).toHaveBeenCalledWith({
        data: {
          accountId,
          name: publicData.name,
          description: publicData.description,
          icon: publicData.icon,
          publicAchievementId: publicData.publicAchievementId,
        },
      });
    });

    it('설명과 아이콘이 없어도 업적을 생성해야 한다', async () => {
      const publicData = {
        name: '최소 데이터 업적',
        description: undefined,
        icon: undefined,
        publicAchievementId: 101,
      };

      achievementRepository.createAchievement.mockResolvedValue({
        id: 51,
        accountId,
        ...publicData,
      } as any);

      const result = await service.createAchievementWithPublicData(
        accountId,
        publicData,
      );

      expect(result).toBeDefined();
      expect(achievementRepository.createAchievement).toHaveBeenCalled();
    });
  });
});
