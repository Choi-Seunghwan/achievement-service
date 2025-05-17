// mission/view/mission-view.ts
import { Mission } from '@prisma/client';
import { MissionTaskView } from '../view/mission-task-view';

export interface MissionView extends Mission {
  missionTasks: MissionTaskView[];
}
