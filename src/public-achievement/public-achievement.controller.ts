import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PublicAchievementService } from './public-achievement.service';
import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';
import { CreatePublicAchievementDto } from './dtos/create-public-achievement.dto';

@Controller('public-achievement')
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
    return res;
  }

  @Get('/')
  async getPublicAchievements() {}

  @Post('/:publicAchievementId/enter')
  async enterPublicAchievement() {}

  @Post('/:publicAchievementId/leave')
  async leavePublicAchievement() {}

  // async updatePublicAchievement() {}
  // async deletePublicAchievement() {}
}
