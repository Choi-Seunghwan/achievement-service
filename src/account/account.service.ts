import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInData, SignUpData } from './types/account.type';
import { AccountStatus } from '@prisma/client';
import { hashPassword } from 'src/common/utils/hashPassword';
import { comparePassword } from 'src/common/utils/comparePassword';
import { AccountRepository } from './account.repository';
import { AuthorizationService } from '@choi-seunghwan/authorization';
import {
  REFRESH_TOKEN_EXPIRATION_TIME,
  TOKEN_EXPIRATION_TIME,
} from './constants/account.constant';
import { nanoid } from 'nanoid';
import { AccountResponseDto } from './dtos/account-response.dto';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async signUp(data: SignUpData) {
    const exists = await this.accountRepository.findAccount({
      where: {
        loginId: data.loginId,
        deletedAt: null,
      },
    });

    if (exists) throw new BadRequestException('already exists');

    await this.accountRepository.createAccount({
      data: {
        loginId: data.loginId,
        email: data.email,
        nickname: data.nickname,
        encryptPassword: await hashPassword(data.password),
        status: AccountStatus.ACTIVATE, // TODO email confirm. PENDING status
      },
    });
  }

  async signIn(
    data: SignInData,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    account: AccountResponseDto;
  }> {
    const account = await this.accountRepository.findAccount({
      where: {
        loginId: data.loginId,
        deletedAt: null,
      },
    });

    if (!account) throw new UnauthorizedException('Not found');

    const isValid = await comparePassword(
      data.password,
      account.encryptPassword,
    );

    if (!isValid) throw new UnauthorizedException('Invalid password');

    const payload = {
      accountId: account.id,
      loginId: account.loginId,
      email: account.email,
    };

    const accessToken = await this.authorizationService.generateToken({
      ...payload,
      exp: TOKEN_EXPIRATION_TIME,
    });

    const refreshToken = await this.authorizationService.generateToken({
      ...payload,
      exp: REFRESH_TOKEN_EXPIRATION_TIME,
    });

    return {
      accessToken,
      refreshToken,
      account: {
        accountId: account.id,
        loginId: account.loginId,
        email: account.email,
        status: account.status,
        nickname: account.nickname,
      },
    };
  }

  async refreshToken(oldRefreshToken: string) {
    const payload =
      await this.authorizationService.validateToken(oldRefreshToken);

    const accessToken = await this.authorizationService.generateToken({
      ...payload,
      exp: TOKEN_EXPIRATION_TIME,
    });

    const newRefreshToken = await this.authorizationService.generateToken({
      ...payload,
      exp: REFRESH_TOKEN_EXPIRATION_TIME,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async getMe(accountId: number): Promise<AccountResponseDto> {
    const account = await this.accountRepository.findUniqueAccount({
      where: {
        id: accountId,
        deletedAt: null,
      },
    });

    if (!account) throw new NotFoundException('user not found');

    return {
      accountId: account.id,
      loginId: account.loginId,
      email: account.email,
      status: account.status,
      nickname: account.nickname,
      image: account.image,
    };
  }

  async getAccounts(accountIds: number[]) {
    return await this.accountRepository.findAccounts({
      where: {
        id: {
          in: accountIds,
        },
        deletedAt: null,
      },
    });
  }

  async createGuest() {
    const guestId = nanoid();

    const guest = await this.accountRepository.createAccount({
      data: {
        nickname: `user_${Date.now()}`,
        isGuest: true,
        status: AccountStatus.ACTIVATE,
        guestId,
      },
    });

    const payload = {
      accountId: guest.id,
      loginId: guest.loginId,
      email: guest.email,
      isGuest: true,
    };

    const accessToken = await this.authorizationService.generateToken({
      ...payload,
      exp: TOKEN_EXPIRATION_TIME,
    });

    const refreshToken = await this.authorizationService.generateToken({
      ...payload,
      exp: REFRESH_TOKEN_EXPIRATION_TIME,
    });

    return {
      accessToken,
      refreshToken,
      account: {
        accountId: guest.id,
        loginId: guest.loginId,
        isGuest: true,
        nickname: guest.nickname,
        guestId,
      },
    };
  }

  async signInWithGuestId(guestId: string) {
    const guest = await this.accountRepository.findAccount({
      where: {
        guestId,
        status: AccountStatus.ACTIVATE,
        isGuest: true,
        deletedAt: null,
      },
    });

    if (!guest) throw new NotFoundException('guest not found');

    const payload = {
      accountId: guest.id,
      loginId: guest.loginId,
      email: guest.email,
      isGuest: true,
    };

    const accessToken = await this.authorizationService.generateToken({
      ...payload,
      exp: TOKEN_EXPIRATION_TIME,
    });

    const refreshToken = await this.authorizationService.generateToken({
      ...payload,
      exp: REFRESH_TOKEN_EXPIRATION_TIME,
    });

    return {
      accessToken,
      refreshToken,
      account: {
        accountId: guest.id,
        loginId: guest.loginId,
        isGuest: true,
        nickname: guest.nickname,
        guestId,
      },
    };
  }

  /**
   * 닉네임 수정
   */
  async updateNickname(id: number, nickname: string) {
    await this.accountRepository.updateAccount({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        nickname,
      },
    });
  }

  /**
   * 프로필 이미지 수정
   * (현재는 앱의 asset avatar 이미지 사용)
   */
  async updateImage(id: number, image: string) {
    await this.accountRepository.updateAccount({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        image,
      },
    });
  }
}
