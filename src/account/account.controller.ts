import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { SignUpDto } from './dtos/sign-up.dto';
import { AccountService } from './account.service';
import { SignInDto } from './dtos/sign-in.dto';

import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { AccountResponseDto } from './dtos/account-response.dto';
import { SignInResponseDto } from './dtos/sign-in-response.dto';
import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';

import { Response } from '@choi-seunghwan/api-util';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RefreshTokenResponseDto } from './dtos/refresh-token-response.dto';
import { GuestSignIn } from './dtos/guest-sign-in.dto';
import { UpdateNicknameDto } from './dtos/update-nickname.dto';
import { UpdateImageDto } from './dtos/update-image.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiOkResponse({ type: Boolean })
  @ApiBadRequestResponse()
  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    await this.accountService.signUp(signUpDto);
    return true;
  }

  @Post('/guest-sign-up')
  async guestSignUp() {
    const result = await this.accountService.createGuest();
    return Response.of(result);
  }

  @Post('/guest-sign-in')
  async guestSignIn(@Body() dto: GuestSignIn) {
    const result = await this.accountService.signInWithGuestId(dto.guestId);
    return Response.of(result);
  }

  @ApiOkResponse({ type: SignInResponseDto })
  @Post('/sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    const { accessToken, refreshToken, account } =
      await this.accountService.signIn({
        loginId: signInDto.loginId,
        password: signInDto.password,
      });

    return Response.of({ accessToken, refreshToken, account });
  }

  @Post('/refresh-token')
  @ApiOkResponse({ type: RefreshTokenResponseDto })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const result = await this.accountService.refreshToken(dto.refreshToken);
    return Response.of(result);
  }

  @ApiOkResponse({ type: AccountResponseDto })
  @UseGuards(AuthGuard)
  @Get('/me')
  async getMe(@User() user: JwtPayload) {
    const result = await this.accountService.getMe(user.accountId);

    return Response.of(result);
  }

  @UseGuards(AuthGuard)
  @Patch('me/nickname')
  async updateNickname(
    @User() user: JwtPayload,
    @Body() dto: UpdateNicknameDto,
  ) {
    await this.accountService.updateNickname(user.accountId, dto.nickname);
    return Response.of(true);
  }

  @UseGuards(AuthGuard)
  @Patch('me/image')
  async updateImage(@User() user: JwtPayload, @Body() dto: UpdateImageDto) {
    await this.accountService.updateImage(user.accountId, dto.image);
    return Response.of(true);
  }
}
