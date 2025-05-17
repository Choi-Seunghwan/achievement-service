import { MissionView } from '../view/mission-view';

export class ActiveMissionsResponseDto {
  oneTimeMissions: MissionView[];
  todayMissions: MissionView[];
  todayCompletedMissions: MissionView[];
  upcomingMissions: MissionView[];
}
