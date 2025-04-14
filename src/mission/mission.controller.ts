import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MissionService } from './mission.service';
import { Response } from '@choi-seunghwan/api-util';
import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';
import { GetMissionsDto } from './dtos/get-missions.dto';
import { CreateMissionDto } from './dtos/create-mission.dto';
import { CompleteMissionDto } from './dtos/complete-mission.dto';
import { GetMissionDto } from './dtos/get-mission.dto';

@Controller('missions')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Get('/')
  @UseGuards(AuthGuard)
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

  @Post('/create')
  @UseGuards(AuthGuard)
  async createMission(@User() user: JwtPayload, @Body() dto: CreateMissionDto) {
    const result = await this.missionService.createMission(user.accountId, {
      name: dto.name,
      description: dto.description,
    });

    return Response.of(result);
  }

  @Post('/complete')
  @UseGuards(AuthGuard)
  async completeMission(
    @User() user: JwtPayload,
    @Body() dto: CompleteMissionDto,
  ) {
    const result = await this.missionService.completeMission(
      user.accountId,
      dto.missionId,
    );

    return Response.of(result);
  }

  @Delete('/delete')
  @UseGuards(AuthGuard)
  async deleteMission(
    @User() user: JwtPayload,
    @Query('missionId') missionId: number,
  ) {
    const result = await this.missionService.deleteMission(
      user.accountId,
      missionId,
    );

    return Response.of(result);
  }

  @Get('/:missionId')
  @UseGuards(AuthGuard)
  async getMission(@User() user: JwtPayload, @Query() query: GetMissionDto) {
    const result = await this.missionService.getMission(
      user.accountId,
      query.missionId,
    );

    return Response.of(result);
  }
}
