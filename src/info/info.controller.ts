import { Controller, Get, UseGuards } from '@nestjs/common';
import { InfoService } from './info.service';
import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';
import { Response } from '@choi-seunghwan/api-util';
import { ApiOkResponse } from '@nestjs/swagger';
import { StatusCountResDto } from './dto/status-count-res.dto';
import { ProfileResDto } from './dto/profile-res.dto';
import { DashboardResDto } from './dto/dashboard-res.dto';

@Controller('info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get('status-count')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: StatusCountResDto,
  })
  async getStatusCount(@User() user: JwtPayload) {
    const result = await this.infoService.getStatusCount(user.accountId);
    return Response.of(result);
  }

  /** 대시보드 데이터 조회 */
  @Get('dashboard')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: DashboardResDto,
  })
  async getDashboard(@User() user: JwtPayload) {
    const result = await this.infoService.getDashboard(user.accountId);
    return Response.of(result);
  }

  /** 성장 포트폴리오 프로필 데이터 */
  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: ProfileResDto,
  })
  async getProfile(@User() user: JwtPayload) {
    const result = await this.infoService.getProfile(user.accountId);
    return Response.of(result);
  }
}
