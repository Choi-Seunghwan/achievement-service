import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { AccountRepository } from './account.repository';
import { AuthorizationService } from '@choi-seunghwan/authorization';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

// hashPassword / comparePassword 모킹
jest.mock('src/common/utils/hashPassword', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password_123'),
}));

jest.mock('src/common/utils/comparePassword', () => ({
  comparePassword: jest.fn(),
}));

// nanoid 모킹
jest.mock('nanoid', () => ({
  nanoid: jest.fn().mockReturnValue('mock_nano_id_123'),
}));

import { comparePassword } from 'src/common/utils/comparePassword';

describe('AccountService', () => {
  let service: AccountService;
  let accountRepository: jest.Mocked<AccountRepository>;
  let authorizationService: jest.Mocked<AuthorizationService>;

  // 테스트용 계정 데이터
  const mockAccount = {
    id: 1,
    loginId: 'testuser',
    email: 'test@example.com',
    nickname: '테스트유저',
    encryptPassword: 'hashed_password_123',
    status: 'ACTIVATE',
    isGuest: false,
    guestId: null,
    image: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AccountRepository,
          useValue: {
            findAccount: jest.fn(),
            findUniqueAccount: jest.fn(),
            findAccounts: jest.fn(),
            createAccount: jest.fn(),
            updateAccount: jest.fn(),
          },
        },
        {
          provide: AuthorizationService,
          useValue: {
            generateToken: jest.fn().mockResolvedValue('mock_token_abc'),
            validateToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    accountRepository = module.get(AccountRepository);
    authorizationService = module.get(AuthorizationService);
  });

  it('서비스가 정의되어 있어야 한다', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    const signUpData = {
      loginId: 'newuser',
      email: 'new@example.com',
      nickname: '새유저',
      password: 'password123',
    };

    it('새로운 계정을 성공적으로 생성해야 한다', async () => {
      // 기존 계정 없음
      accountRepository.findAccount.mockResolvedValue(null);
      accountRepository.createAccount.mockResolvedValue(mockAccount as any);

      await service.signUp(signUpData);

      expect(accountRepository.findAccount).toHaveBeenCalledWith({
        where: {
          loginId: signUpData.loginId,
          deletedAt: null,
        },
      });
      expect(accountRepository.createAccount).toHaveBeenCalledWith({
        data: expect.objectContaining({
          loginId: signUpData.loginId,
          email: signUpData.email,
          nickname: signUpData.nickname,
          encryptPassword: 'hashed_password_123',
          status: 'ACTIVATE',
        }),
      });
    });

    it('이미 존재하는 loginId인 경우 BadRequestException을 던져야 한다', async () => {
      // 기존 계정 존재
      accountRepository.findAccount.mockResolvedValue(mockAccount as any);

      await expect(service.signUp(signUpData)).rejects.toThrow(
        BadRequestException,
      );
      expect(accountRepository.createAccount).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    const signInData = {
      loginId: 'testuser',
      password: 'password123',
    };

    it('올바른 자격증명으로 로그인하면 토큰을 반환해야 한다', async () => {
      accountRepository.findAccount.mockResolvedValue(mockAccount as any);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      authorizationService.generateToken
        .mockResolvedValueOnce('access_token_123')
        .mockResolvedValueOnce('refresh_token_456');

      const result = await service.signIn(signInData);

      expect(result).toEqual({
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_456',
        account: {
          accountId: mockAccount.id,
          loginId: mockAccount.loginId,
          email: mockAccount.email,
          status: mockAccount.status,
          nickname: mockAccount.nickname,
        },
      });
      expect(authorizationService.generateToken).toHaveBeenCalledTimes(2);
    });

    it('존재하지 않는 계정으로 로그인 시 UnauthorizedException을 던져야 한다', async () => {
      accountRepository.findAccount.mockResolvedValue(null);

      await expect(service.signIn(signInData)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('잘못된 비밀번호로 로그인 시 UnauthorizedException을 던져야 한다', async () => {
      accountRepository.findAccount.mockResolvedValue(mockAccount as any);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.signIn(signInData)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('createGuest (게스트 회원가입)', () => {
    it('게스트 계정을 성공적으로 생성하고 토큰을 반환해야 한다', async () => {
      const mockGuest = {
        id: 99,
        loginId: null,
        email: null,
        nickname: 'user_1234567890',
        isGuest: true,
        guestId: 'mock_nano_id_123',
        status: 'ACTIVATE',
      };

      accountRepository.createAccount.mockResolvedValue(mockGuest as any);
      authorizationService.generateToken
        .mockResolvedValueOnce('guest_access_token')
        .mockResolvedValueOnce('guest_refresh_token');

      const result = await service.createGuest();

      expect(result).toEqual({
        accessToken: 'guest_access_token',
        refreshToken: 'guest_refresh_token',
        account: {
          accountId: mockGuest.id,
          loginId: mockGuest.loginId,
          isGuest: true,
          nickname: mockGuest.nickname,
          guestId: 'mock_nano_id_123',
        },
      });
      expect(accountRepository.createAccount).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isGuest: true,
          status: 'ACTIVATE',
          guestId: 'mock_nano_id_123',
        }),
      });
      expect(authorizationService.generateToken).toHaveBeenCalledTimes(2);
      // 게스트 토큰 payload에 isGuest가 true인지 확인
      expect(authorizationService.generateToken).toHaveBeenCalledWith(
        expect.objectContaining({ isGuest: true }),
      );
    });
  });
});
