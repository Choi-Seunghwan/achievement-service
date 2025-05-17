// utils/to-mission-task-view.ts
import { MissionTask } from '@prisma/client';
import { MissionTaskView } from '../view/mission-task-view';

export function toMissionTaskView(
  task: MissionTask,
  todayCompleted: boolean,
): MissionTaskView {
  return {
    ...task,
    todayCompleted,
  };
}
