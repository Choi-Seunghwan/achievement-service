import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PublicMissionTaskRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createMany(data: Prisma.PublicMissionTaskCreateManyInput[]) {
    return this.prismaService.publicMissionTask.createMany({
      data,
    });
  }
}
