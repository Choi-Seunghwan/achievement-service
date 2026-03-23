import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class FeedbackRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createFeedback(args: Prisma.FeedbackCreateArgs) {
    return await this.prismaService.feedback.create(args);
  }
}
