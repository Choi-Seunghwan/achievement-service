import { getTodayStart } from 'src/common/utils/getTodayStart';
import { weekdayMap } from './weekdayMap';

export const getTodayWeekday = () => {
  return weekdayMap[getTodayStart().getDay()];
};
