import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { AchievementService } from './achievement.service';

import { GetUserAchievementsDto } from './dto/get-user-achievements.dto';
import { PagingResponse, Response } from '@choi-seunghwan/api-util';

@Controller('achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Post('/')
  @UseGuards(AuthGuard)
  async createAchievement(
    @User() user: JwtPayload,
    @Body() dto: CreateAchievementDto,
  ) {
    const res = await this.achievementService.createAchievement(
      user.accountId,
      {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        missionIds: dto.missionIds,
      },
    );
    return Response.of(res);
  }

  @Get('/active')
  @UseGuards(AuthGuard)
  async getActiveAchievements(@User() user: JwtPayload) {
    const res = await this.achievementService.getUserActiveAchievements(
      user.accountId,
    );
    return Response.of(res);
  }

  @Get('/:achievementId')
  @UseGuards(AuthGuard)
  async getAchievement(
    @User() user: JwtPayload,
    @Param('achievementId') achievementId: number,
  ) {
    const res = await this.achievementService.getAchievement(
      user.accountId,
      achievementId,
    );
    return Response.of(res);
  }

  @Get('/')
  @UseGuards(AuthGuard)
  async getUserAchievements(
    @User() user: JwtPayload,
    @Query() query: GetUserAchievementsDto,
  ) {
    const res = await this.achievementService.getUserAchievements(
      user.accountId,
      { page: query.page || 1, size: query.size || 10 },
      query.status || 'IN_PROGRESS',
    );
    return PagingResponse.of(res.items, res.total, query.page, query.size);
  }

  @Post('/:achievementId/complete')
  @UseGuards(AuthGuard)
  async completeAchievement(
    @User() user: JwtPayload,
    @Param('achievementId') achievementId: number,
  ) {
    const res = await this.achievementService.completeAchievement(
      user.accountId,
      achievementId,
    );
    return Response.of(res);
  }

  @Delete('/:achievementId/')
  @UseGuards(AuthGuard)
  async deleteAchievement(
    @User() user: JwtPayload,
    @Param('achievementId') achievementId: number,
  ) {
    const res = await this.achievementService.deleteAchievement(
      user.accountId,
      achievementId,
    );
    return Response.of(res);
  }
}
