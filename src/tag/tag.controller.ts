import { AuthGuard, JwtPayload, User } from '@choi-seunghwan/authorization';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { Response } from '@choi-seunghwan/api-util';
import { TagService } from './tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('')
  @UseGuards(AuthGuard)
  async getTags(@User() user: JwtPayload) {
    const result = await this.tagService.getTags(user.accountId);

    return Response.of(result);
  }

  @Post('')
  @UseGuards(AuthGuard)
  async createTag(@User() user: JwtPayload, @Body() dto: CreateTagDto) {
    const result = await this.tagService.createTag(user.accountId, {
      name: dto.name,
      color: dto.color,
    });

    return Response.of(result);
  }
}
