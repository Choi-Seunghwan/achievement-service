import { Controller, Get, UseGuards } from '@nestjs/common';
import { InfoService } from './info.service';
import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';
import { Response } from '@choi-seunghwan/api-util';
import { ApiOkResponse } from '@nestjs/swagger';
import { StatusCountResDto } from './dto/status-count-res.dto';

@Controller('info')
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get('status-count')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: StatusCountResDto,
  })
  async getStatusCount(@User() user: JwtPayload) {
    const result = await this.infoService.getStatusCount(user.accountId);
    return Response.of(result);
  }
}
