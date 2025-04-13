import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MissionService } from './mission.service';
import { Response } from '@choi-seunghwan/api-util';
import { JwtPayload, User } from '@choi-seunghwan/authorization';
import { GetMissionsDto } from './dtos/get-missions.dto';
import { CreateMissionDto } from './dtos/create-mission.dto';

@Controller('missions')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Get('')
  async getMissions(@User() user: JwtPayload, @Query() query: GetMissionsDto) {
    const result = await this.missionService.getMissionsWithPaging(
      {
        accountId: user.accountId,
        status: query.status ? query.status : undefined,
      },
      { page: query.page, size: query.size },
    );

    return Response.of(result);
  }

  @Post('create')
  async createMission(@User() user: JwtPayload, @Body() dto: CreateMissionDto) {
    const result = await this.missionService.createMission(user.accountId, {
      name: dto.name,
      description: dto.description,
    });

    return Response.of(result);
  }
}
