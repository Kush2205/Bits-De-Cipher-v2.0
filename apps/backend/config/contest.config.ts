// Contest timing configuration
export const CONTEST_START_TIME = "2026-01-16T19:00:00+05:30";
export const CONTEST_DURATION_HOURS = 26;

/**
 * Get the contest start time as a Date object
 */
export const getContestStartTime = (): Date => {
  return new Date(CONTEST_START_TIME);
};

/**
 * Get the contest end time as a Date object (24 hours after start)
 */
export const getContestEndTime = (): Date => {
  const startTime = getContestStartTime();
  const endTime = new Date(startTime.getTime() + CONTEST_DURATION_HOURS * 60 * 60 * 1000);
  return endTime;
};

/**
 * Check if the contest has started
 */
export const hasContestStarted = (): boolean => {
  const now = new Date();
  const startTime = getContestStartTime();
  return now >= startTime;
};

/**
 * Check if the contest has ended
 */
export const hasContestEnded = (): boolean => {
  const now = new Date();
  const endTime = getContestEndTime();
  return now >= endTime;
};

/**
 * Get remaining time in milliseconds until contest ends
 * Returns 0 if contest has ended
 */
export const getRemainingTime = (): number => {
  const now = new Date();
  const endTime = getContestEndTime();
  const remaining = endTime.getTime() - now.getTime();
  return Math.max(0, remaining);
};

/**
 * Get contest status
 */
export const getContestStatus = (): 'not-started' | 'active' | 'ended' => {
  if (!hasContestStarted()) return 'not-started';
  if (hasContestEnded()) return 'ended';
  return 'active';
};
