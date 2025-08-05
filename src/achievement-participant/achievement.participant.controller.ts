import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AchievementParticipantService } from './achievement-participant.service';
import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';

@Controller('achievement-participant')
export class AchievementParticipantController {
  constructor(
    private readonly achievementParticipantService: AchievementParticipantService,
  ) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  async getMyParticipatingAchievements(@User() user: JwtPayload) {
    const res =
      await this.achievementParticipantService.getMyParticipatingAchievements(
        user.accountId,
      );

    return res;
  }

  // 공개 업적 참여
  // @Post(':id/join')
  // join(
  //   @User() user: JwtPayload,
  //   @Param('publicAchievementId') publicAchievementId: number,
  // ) {
  //   return this.achievementParticipantService.joinPublicAchievement(
  //     user.accountId,
  //     publicAchievementId,
  //   );
  // }

  // // 공개 업적 나가기
  // @Post(':id/leave')
  // leave(@User() user: JwtPayload, @Param('id') publicAchievementId: number) {
  //   return this.achievementParticipantService.leavePublicAchievement(
  //     user.accountId,
  //     +publicAchievementId,
  //   );
  // }
}
