import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PublicAchievementService } from './public-achievement.service';
import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';
import { CreatePublicAchievementDto } from './dtos/create-public-achievement.dto';
import { GetPublicAchievementsDto } from './dtos/get-public-achievements.dto';
import { PagingResponse, Response } from '@choi-seunghwan/api-util';
import { getPublicAchievementCommentDto } from './dtos/get-public-achievement-comment.dto';

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
      query.keyword,
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
    return PagingResponse.of(
      result.items,
      result.total,
      1,
      result.items.length,
    );
  }

  @Get('/:publicAchievementId')
  @UseGuards(AuthGuard)
  async getPublicAchievement(
    @User() user: JwtPayload,
    @Param('publicAchievementId') publicAchievementId: number,
  ) {
    const result = await this.publicAchievementService.getPublicAchievement(
      user.accountId,
      publicAchievementId,
    );
    return Response.of(result);
  }

  @Get('/:publicAchievementId/comments')
  @UseGuards(AuthGuard)
  async getPublicAchievementComments(
    @User() user: JwtPayload,
    @Param('publicAchievementId') publicAchievementId: number,
    @Query() query: getPublicAchievementCommentDto,
  ) {
    const result =
      await this.publicAchievementService.getPublicAchievementCommentsWithPaging(
        publicAchievementId,
        query,
      );
    return PagingResponse.of(
      result.items,
      result.total,
      query.page,
      query.size,
    );
  }

  @Post('/:publicAchievementId/comments')
  @UseGuards(AuthGuard)
  async createPublicAchievementComment(
    @User() user: JwtPayload,
    @Param('publicAchievementId') publicAchievementId: number,
    @Body() data: { comment: string },
  ) {
    const result =
      await this.publicAchievementService.createPublicAchievementComment(
        user.accountId,
        publicAchievementId,
        data,
      );
    return Response.of(result);
  }

  @Post('/:publicAchievementId/join')
  @UseGuards(AuthGuard)
  async joinPublicAchievement(
    @User() user: JwtPayload,
    @Param('publicAchievementId') publicAchievementId: number,
  ) {
    const res = await this.publicAchievementService.joinPublicAchievement(
      user.accountId,
      publicAchievementId,
    );
    return Response.of(res);
  }

  @Post('/:publicAchievementId/leave')
  @UseGuards(AuthGuard)
  async leavePublicAchievement(
    @User() user: JwtPayload,
    @Param('publicAchievementId') publicAchievementId: number,
  ) {
    const res = await this.publicAchievementService.leavePublicAchievement(
      user.accountId,
      publicAchievementId,
    );
    return Response.of(res);
  }

  // @Post('/:publicAchievementId/leave')
  // async leavePublicAchievement() {}

  // async updatePublicAchievement() {}
  // async deletePublicAchievement() {}
}
