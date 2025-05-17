import { Mission } from '@prisma/client';
import { MissionTaskView } from './mission-task-view';

export interface MissionView extends Mission {
  missionTasks: MissionTaskView[];
}
