import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class TagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTag(args: Prisma.TagCreateArgs) {
    return await this.prisma.tag.create(args);
  }

  async getTagCount(args: Prisma.TagCountArgs) {
    return await this.prisma.tag.count(args);
  }

  async getTags(args: Prisma.TagFindManyArgs) {
    return await this.prisma.tag.findMany(args);
  }

  async getTag(args: Prisma.TagFindUniqueArgs) {
    return await this.prisma.tag.findUnique(args);
  }

  async updateTag(args: Prisma.TagUpdateArgs) {
    return await this.prisma.tag.update(args);
  }
}
