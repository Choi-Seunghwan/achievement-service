import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PublicAchievementService } from './public-achievement.service';
import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';
import { CreatePublicAchievementDto } from './dtos/create-public-achievement.dto';
import { GetPublicAchievementsDto } from './dtos/get-public-achievements.dto';
import { PagingResponse, Response } from '@choi-seunghwan/api-util';

@Controller('public-achievements')
export class PublicAchievementController {
  constructor(
    private readonly publicAchievementService: PublicAchievementService,
  ) {}

  @Post('/')
  @UseGuards(AuthGuard)
  async createPublicAchievement(
    @User() user: JwtPayload,
    @Body() dto: CreatePublicAchievementDto,
  ) {
    const res = await this.publicAchievementService.createPublicAchievement(
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

  @Get('/')
  @UseGuards(AuthGuard)
  async getPublicAchievements(
    @User() user: JwtPayload,
    @Query() query: GetPublicAchievementsDto,
  ) {
    const result = await this.publicAchievementService.getPublicAchievements(
      user.accountId,
      { page: query.page, size: query.size },
    );
    return PagingResponse.of(
      result.items,
      result.total,
      query.page,
      query.size,
    );
  }

  @Get('/popular')
  @UseGuards(AuthGuard)
  async getPopularPublicAchievements(@User() user: JwtPayload) {
    const result =
      await this.publicAchievementService.getPopularPublicAchievements(
        user.accountId,
      );
    return Response.of(result);
  }
  // @Post('/:publicAchievementId/enter')
  // async enterPublicAchievement() {}

  // @Post('/:publicAchievementId/leave')
  // async leavePublicAchievement() {}

  // async updatePublicAchievement() {}
  // async deletePublicAchievement() {}
}
