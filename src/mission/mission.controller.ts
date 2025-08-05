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

@Controller('missions')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  /**
   * missions 조회
   */
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

  /**
   * active missions 조회
   */
  @Get('/active')
  @UseGuards(AuthGuard)
  async getActiveMissions(@User() user: JwtPayload) {
    const result = await this.missionService.getActiveMissions(user.accountId);
    return Response.of(result);
  }

  /**
   * mission 생성
   */
  @Post('/')
  @UseGuards(AuthGuard)
  async createMission(@User() user: JwtPayload, @Body() dto: CreateMissionDto) {
    const result = await this.missionService.createMission(user.accountId, {
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      repeatType: dto.repeatType,
      repeatDays: dto.repeatDays,
      tasks: dto.tasks,
      tagIds: dto.tagIds,
    });

    return Response.of(result);
  }

  /**
   * achievement 연결 가능 missions 조회
   */
  @Get('available-for-achievement')
  @UseGuards(AuthGuard)
  async getAvailableMissionsForAchievement(@User() user: JwtPayload) {
    const result = await this.missionService.getAvailableMissionsForAchievement(
      user.accountId,
    );
    return Response.of(result);
  }

  /**
   * mission 수정
   */
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
        icon: dto.icon,
        repeatType: dto.repeatType,
        repeatDays: dto.repeatDays,
        tasks: dto.tasks,
        tagIds: dto.tagIds,
      },
    );
    return Response.of(result);
  }

  /**
   * mission 완료
   */
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

  /**
   * repeat missions 종결
   */
  @Post('/:missionId/close-repeat')
  @UseGuards(AuthGuard)
  async closeRepeatMission(
    @User() user: JwtPayload,
    @Param() param: MissionIdParam,
  ) {
    const result = await this.missionService.closeRepeatMission(
      user.accountId,
      param.missionId,
    );

    return Response.of(result);
  }

  /**
   * 미션 완료 취소
   */
  @Post('/:missionId/cancel-completion')
  @UseGuards(AuthGuard)
  async cancelMissionCompletion(
    @User() user: JwtPayload,
    @Param() param: MissionIdParam,
  ) {
    const result = await this.missionService.cancelMissionCompletion(
      user.accountId,
      param.missionId,
    );

    return Response.of(result);
  }

  /**
   * mission 삭제
   */
  @Delete(':missionId/')
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

  /**
   * mission 상세 조회
   */
  @Get('/:missionId')
  @UseGuards(AuthGuard)
  async getMissionDetail(
    @User() user: JwtPayload,
    @Param() param: MissionIdParam,
  ) {
    const result = await this.missionService.getMissionDetail(
      user.accountId,
      param.missionId,
    );

    return Response.of(result);
  }

  /**
   * mission task 생성
   */
  // @Post('/:missionId/tasks')
  // @UseGuards(AuthGuard)
  // async createTask(
  //   @User() user: JwtPayload,
  //   @Param() missionIdParam: MissionIdParam,
  //   // @Body() dto: CreateMissionTaskDto,
  // ) {
  //   const result = await this.missionService.createMissionTask(
  //     user.accountId,
  //     missionIdParam.missionId,
  //     // { name: dto.name },
  //   );

  //   return Response.of(result);
  // }

  /**
   * mission task 완료
   */
  @Post('/:missionId/tasks/:taskId/complete')
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

  @Post('/:missionId/tasks/:taskId/cancel-completion')
  @UseGuards(AuthGuard)
  async cancelTaskCompletion(
    @User() user: JwtPayload,
    @Param() missionId: MissionIdParam,
    @Param() taskId: TaskIdParam,
  ) {
    const result = await this.missionService.cancelMissionTaskCompletion(
      user.accountId,
      missionId.missionId,
      taskId.taskId,
    );

    return Response.of(result);
  }

  /**
   * mission task 정렬
   */
  // @Post('/:missionId/tasks/order')
  // @UseGuards(AuthGuard)
  // async updateTaskOrder() {
  //   // @Param() missionId: MissionIdParam, // @User() user: JwtPayload,
  // }
}
