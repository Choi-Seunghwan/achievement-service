import { startOfDay } from 'date-fns';

export const getTodayStart = () => {
  return startOfDay(new Date());
};
