import { MissionTask } from '@prisma/client';

export interface MissionTaskView extends MissionTask {
  todayCompleted?: boolean;
}
