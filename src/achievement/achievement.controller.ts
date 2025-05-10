import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';

@Controller('achievements')
export class AchievementController {
  constructor() {}

  @Post('/')
  @UseGuards(AuthGuard)
  async createAchievement(
    @User() user: JwtPayload,
    @Body() dto: CreateAchievementDto,
  ) {}
}
