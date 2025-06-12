import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { AchievementService } from './achievement.service';

import { GetUserAchievementsDto } from './dto/get-user-achievements.dto';

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
    return res;
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
    return res;
  }
}
