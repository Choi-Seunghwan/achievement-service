import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MissionService } from './mission.service';
import { PagingResponse, Response } from '@choi-seunghwan/api-util';
import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';
import { GetMissionsDto } from './dto/get-missions.dto';
import { CreateMissionDto } from './dto/create-mission.dto';
import { MissionIdParam } from './dto/mission-id.param';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { TaskIdParam } from './dto/task-id.param';
import { CreateMissionTaskDto } from './dto/create-mission-task.dto';

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

    return PagingResponse.of(
      result.items,
      result.total,
      query.page,
      query.size,
    );
  }

  @Post('/')
  @UseGuards(AuthGuard)
  async createMission(@User() user: JwtPayload, @Body() dto: CreateMissionDto) {
    const result = await this.missionService.createMission(user.accountId, {
      name: dto.name,
      description: dto.description,
      repeatType: dto.repeatType,
      repeatDays: dto.repeatDays,
      tasks: dto.tasks,
      tagIds: dto.tagIds,
    });

    return Response.of(result);
  }

  @Patch('/:missionId')
  @UseGuards(AuthGuard)
  async updateMission(
    @User() user: JwtPayload,
    @Param() param: MissionIdParam,
    @Body() dto: UpdateMissionDto,
  ) {
    const result = await this.missionService.updateMission(
      user.accountId,
      param.missionId,
      {
        name: dto.name,
        description: dto.description,
      },
    );
    return Response.of(result);
  }

  @Post(':missionId/complete')
  @UseGuards(AuthGuard)
  async completeMission(
    @User() user: JwtPayload,
    @Param() param: MissionIdParam,
  ) {
    const result = await this.missionService.completeMission(
      user.accountId,
      param.missionId,
    );

    return Response.of(result);
  }

  @Delete(':missionId/delete')
  @UseGuards(AuthGuard)
  async deleteMission(
    @User() user: JwtPayload,
    @Param() param: MissionIdParam,
  ) {
    const result = await this.missionService.deleteMission(
      user.accountId,
      param.missionId,
    );

    return Response.of(result);
  }

  @Get('/:missionId')
  @UseGuards(AuthGuard)
  async getMission(@User() user: JwtPayload, @Query() query: MissionIdParam) {
    const result = await this.missionService.getMission(
      user.accountId,
      query.missionId,
    );

    return Response.of(result);
  }

  /** Mission Task */

  @Post('/:missionId/task')
  @UseGuards(AuthGuard)
  async createTask(
    @User() user: JwtPayload,
    @Param() missionIdParam: MissionIdParam,
    @Body() dto: CreateMissionTaskDto,
  ) {
    const result = await this.missionService.createMissionTask(
      user.accountId,
      missionIdParam.missionId,
      { name: dto.name },
    );

    return Response.of(result);
  }

  @Post('/:missionId/task/:taskId/complete')
  @UseGuards(AuthGuard)
  async completeTask(
    @User() user: JwtPayload,
    @Param() missionId: MissionIdParam,
    @Param() taskId: TaskIdParam,
  ) {
    const result = await this.missionService.completeMissionTask(
      user.accountId,
      missionId.missionId,
      taskId.taskId,
    );

    return Response.of(result);
  }

  @Post('/:missionId/task/:taskId/update')
  @UseGuards(AuthGuard)
  async updateTask() {
    // @Body() dto: any, // @Param() taskId: TaskIdParam, // @Param() param: MissionIdParam, // @User() user: JwtPayload,
    //
  }

  @Post('/:missionId/task/order')
  @UseGuards(AuthGuard)
  async updateTaskOrder() {
    // @Param() missionId: MissionIdParam, // @User() user: JwtPayload,
  }
}
