import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PublicAchievementCommentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createPublicAchievementComment(
    data: Prisma.PublicAchievementCommentCreateInput,
  ) {
    return this.prismaService.publicAchievementComment.create({ data });
  }

  async getPublicAchievementComments(
    args: Prisma.PublicAchievementCommentFindManyArgs,
  ) {
    return this.prismaService.publicAchievementComment.findMany({
      ...args,
      where: { ...args.where, deletedAt: null },
    });
  }

  async getPublicAchievementCommentsWithPaging(
    args: Prisma.PublicAchievementCommentFindManyArgs,
    paging: { page: number; size: number },
  ) {
    const items = await this.prismaService.publicAchievementComment.findMany({
      ...args,
      where: { ...args.where, deletedAt: null },
      skip: (paging.page - 1) * paging.size,
      take: paging.size,
      orderBy: args.orderBy || { createdAt: 'desc' },
    });

    const total = await this.prismaService.publicAchievementComment.count({
      where: { ...args.where, deletedAt: null },
    });

    return {
      items,
      total,
    };
  }

  async getPublicAchievementComment(
    args: Prisma.PublicAchievementCommentFindUniqueArgs,
  ) {
    return this.prismaService.publicAchievementComment.findUnique({
      ...args,
      where: { ...args.where, deletedAt: null },
    });
  }

  async updatePublicAchievementComment(
    args: Prisma.PublicAchievementCommentUpdateArgs,
  ) {
    return this.prismaService.publicAchievementComment.update({
      ...args,
      where: { ...args.where, deletedAt: null },
      data: { ...args.data, updatedAt: new Date() },
    });
  }
}
