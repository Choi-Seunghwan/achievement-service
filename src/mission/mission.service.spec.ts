import { Test, TestingModule } from '@nestjs/testing';
import { MissionService } from './mission.service';
import { MissionRepository } from './mission.repository';
import { TagService } from 'src/tag/tag.service';
import { BadRequestException } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';

describe('MissionService', () => {
  let service: MissionService;
  let missionRepository: jest.Mocked<MissionRepository>;

  // 테스트용 미션 데이터 (일회성 미션)
  const mockMission = {
    id: 1,
    accountId: 1,
    name: '테스트 미션',
    description: '미션 설명',
    icon: '🎯',
    status: 'IN_PROGRESS',
    repeatType: 'NONE',
    repeatDays: [],
    completedAt: null,
    achievementId: null,
    publicMissionId: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    missionTasks: [],
    missionTags: [],
    achievement: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionService,
        {
          provide: MissionRepository,
          useValue: {
            getMission: jest.fn(),
            getMissions: jest.fn(),
            getMissionsWithPaging: jest.fn(),
            createMission: jest.fn(),
            updateMission: jest.fn(),
            updateMissions: jest.fn(),
            createMissionHistory: jest.fn(),
            createMissionTask: jest.fn(),
            updateMissionTask: jest.fn(),
            findTodayMissionsHistories: jest.fn(),
            findTodayMissionsHistoriesByMission: jest.fn(),
            getMissionHistories: jest.fn(),
            getMissionHistory: jest.fn(),
            getMissionCount: jest.fn(),
          },
        },
        {
          provide: TagService,
          useValue: {
            createMissionTag: jest.fn(),
            deleteMissionTag: jest.fn(),
          },
        },
        {
          provide: TransactionHost,
          useValue: {
            tx: {},
            withTransaction: jest.fn((...args) => {
              // @Transactional 데코레이터는 (propagation, options, fn) 형태로 호출
              const fn = args[args.length - 1];
              return typeof fn === 'function' ? fn() : undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MissionService>(MissionService);
    missionRepository = module.get(MissionRepository);
  });

  it('서비스가 정의되어 있어야 한다', () => {
    expect(service).toBeDefined();
  });

  describe('completeMission', () => {
    const accountId = 1;
    const missionId = 1;

    it('일회성 미션을 성공적으로 완료해야 한다', async () => {
      // 태스크 없는 진행 중 미션
      missionRepository.getMission.mockResolvedValue(mockMission as any);
      missionRepository.updateMission.mockResolvedValue(undefined);
      missionRepository.createMissionHistory.mockResolvedValue(undefined);

      const result = await service.completeMission(accountId, missionId);

      expect(result).toBe(true);
      expect(missionRepository.updateMission).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: missionId, accountId },
          data: expect.objectContaining({ status: 'COMPLETED' }),
        }),
      );
      expect(missionRepository.createMissionHistory).toHaveBeenCalledWith({
        data: {
          completed: true,
          missionId,
        },
      });
    });

    it('이미 완료된 미션인 경우 BadRequestException을 던져야 한다', async () => {
      const completedMission = {
        ...mockMission,
        status: 'COMPLETED',
        completedAt: new Date(),
      };
      missionRepository.getMission.mockResolvedValue(completedMission as any);

      await expect(
        service.completeMission(accountId, missionId),
      ).rejects.toThrow(BadRequestException);
    });

    it('태스크가 미완료된 일회성 미션 완료 시 BadRequestException을 던져야 한다', async () => {
      const missionWithIncompleteTasks = {
        ...mockMission,
        missionTasks: [
          {
            id: 10,
            name: '태스크 1',
            status: 'IN_PROGRESS',
            missionId: 1,
          },
        ],
      };
      missionRepository.getMission.mockResolvedValue(
        missionWithIncompleteTasks as any,
      );

      await expect(
        service.completeMission(accountId, missionId),
      ).rejects.toThrow(BadRequestException);
    });

    it('모든 태스크가 완료된 일회성 미션을 성공적으로 완료해야 한다', async () => {
      const missionWithCompleteTasks = {
        ...mockMission,
        missionTasks: [
          {
            id: 10,
            name: '태스크 1',
            status: 'COMPLETED',
            missionId: 1,
          },
          {
            id: 11,
            name: '태스크 2',
            status: 'COMPLETED',
            missionId: 1,
          },
        ],
      };
      missionRepository.getMission.mockResolvedValue(
        missionWithCompleteTasks as any,
      );
      missionRepository.updateMission.mockResolvedValue(undefined);
      missionRepository.createMissionHistory.mockResolvedValue(undefined);

      const result = await service.completeMission(accountId, missionId);

      expect(result).toBe(true);
    });
  });

  describe('cancelMissionCompletion', () => {
    const accountId = 1;
    const missionId = 1;

    it('완료된 일회성 미션의 완료를 취소해야 한다', async () => {
      const completedMission = {
        ...mockMission,
        status: 'COMPLETED',
        completedAt: new Date(),
        achievement: null,
      };
      missionRepository.getMission.mockResolvedValue(completedMission as any);
      missionRepository.updateMission.mockResolvedValue(undefined);
      missionRepository.createMissionHistory.mockResolvedValue(undefined);

      const result = await service.cancelMissionCompletion(
        accountId,
        missionId,
      );

      expect(result).toBe(true);
      expect(missionRepository.updateMission).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: missionId, accountId },
          data: { status: 'IN_PROGRESS', completedAt: null },
        }),
      );
      expect(missionRepository.createMissionHistory).toHaveBeenCalledWith({
        data: {
          completed: false,
          missionId,
        },
      });
    });

    it('업적이 완료된 미션은 취소할 수 없어야 한다', async () => {
      const missionWithCompletedAchievement = {
        ...mockMission,
        status: 'COMPLETED',
        achievement: { status: 'COMPLETED' },
      };
      missionRepository.getMission.mockResolvedValue(
        missionWithCompletedAchievement as any,
      );

      await expect(
        service.cancelMissionCompletion(accountId, missionId),
      ).rejects.toThrow(BadRequestException);
    });

    it('완료되지 않은 일회성 미션 취소 시 BadRequestException을 던져야 한다', async () => {
      // 진행 중인 미션 (완료되지 않음)
      missionRepository.getMission.mockResolvedValue({
        ...mockMission,
        achievement: null,
      } as any);

      await expect(
        service.cancelMissionCompletion(accountId, missionId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createMissionsWithPublicData', () => {
    const accountId = 1;
    const achievementId = 100;

    it('공개 미션 데이터로 미션과 MissionTask를 생성해야 한다', async () => {
      const publicMissionData = [
        {
          publicMissionId: 10,
          name: '공개 미션 1',
          icon: '🏃',
          repeatType: 'DAILY' as any,
          repeatDays: [] as any,
          description: '매일 운동하기',
          tasks: [
            { id: 100, name: '스트레칭' },
            { id: 101, name: '러닝 30분' },
          ],
        },
        {
          publicMissionId: 11,
          name: '공개 미션 2',
          icon: '📚',
          repeatType: 'NONE' as any,
          repeatDays: [] as any,
          description: '책 읽기',
          tasks: [],
        },
      ];

      // 첫 번째 미션 생성 (태스크 있음)
      missionRepository.createMission
        .mockResolvedValueOnce({ id: 200 } as any)
        .mockResolvedValueOnce({ id: 201 } as any);
      missionRepository.createMissionTask.mockResolvedValue(undefined);

      const result = await service.createMissionsWithPublicData(
        accountId,
        achievementId,
        publicMissionData,
      );

      expect(result).toBe(true);
      // 미션 2개 생성
      expect(missionRepository.createMission).toHaveBeenCalledTimes(2);
      // 첫 번째 미션 생성 시 accountId, achievementId, publicMissionId 확인
      expect(missionRepository.createMission).toHaveBeenCalledWith({
        data: expect.objectContaining({
          accountId,
          achievementId,
          name: '공개 미션 1',
          publicMissionId: 10,
        }),
      });
      // 태스크 2개 생성 (첫 번째 미션의 태스크)
      expect(missionRepository.createMissionTask).toHaveBeenCalledTimes(2);
      expect(missionRepository.createMissionTask).toHaveBeenCalledWith({
        data: {
          name: '스트레칭',
          mission: { connect: { id: 200 } },
          publicMissionTask: { connect: { id: 100 } },
        },
      });
      expect(missionRepository.createMissionTask).toHaveBeenCalledWith({
        data: {
          name: '러닝 30분',
          mission: { connect: { id: 200 } },
          publicMissionTask: { connect: { id: 101 } },
        },
      });
    });

    it('태스크가 없는 공개 미션도 정상적으로 생성해야 한다', async () => {
      const publicMissionData = [
        {
          publicMissionId: 10,
          name: '태스크 없는 미션',
          icon: '🎯',
          repeatType: 'NONE' as any,
          repeatDays: [] as any,
          description: '설명',
          tasks: [],
        },
      ];

      missionRepository.createMission.mockResolvedValue({ id: 200 } as any);

      const result = await service.createMissionsWithPublicData(
        accountId,
        achievementId,
        publicMissionData,
      );

      expect(result).toBe(true);
      expect(missionRepository.createMission).toHaveBeenCalledTimes(1);
      // 태스크 생성은 호출되지 않아야 함
      expect(missionRepository.createMissionTask).not.toHaveBeenCalled();
    });
  });
});
