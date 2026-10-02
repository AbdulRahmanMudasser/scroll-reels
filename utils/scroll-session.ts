import type { ScrollStatus } from "./messages";

export type ScrollSession = {
  getStatus: (isReelsPage: boolean) => ScrollStatus;
  start: (minutes: number) => ScrollStatus;
  stop: (completed?: boolean) => ScrollStatus;
  syncRemainingTime: () => number;
};

type Clock = () => number;

const clampMinutes = (minutes: number) => Math.min(180, Math.max(1, Number(minutes) || 10));

export const createScrollSession = (now: Clock = Date.now): ScrollSession => {
  const state = {
    completed: false,
    durationMinutes: 10,
    remainingSeconds: 0,
    running: false,
    sessionEndsAt: 0
  };

  const syncRemainingTime = () => {
    if (state.running) {
      state.remainingSeconds = Math.max(0, Math.ceil((state.sessionEndsAt - now()) / 1000));
    }
    return state.remainingSeconds;
  };

  const getStatus = (isReelsPage: boolean): ScrollStatus => ({
    completed: state.completed,
    durationMinutes: state.durationMinutes,
    isReelsPage,
    remainingSeconds: state.remainingSeconds,
    running: state.running
  });

  const start = (minutes: number) => {
    state.completed = false;
    state.durationMinutes = clampMinutes(minutes);
    state.running = true;
    state.sessionEndsAt = now() + state.durationMinutes * 60 * 1000;
    syncRemainingTime();
    return getStatus(true);
  };

  const stop = (completed = false) => {
    syncRemainingTime();
    state.running = false;
    state.completed = completed;
    state.remainingSeconds = completed ? 0 : state.remainingSeconds;
    state.sessionEndsAt = 0;
    return getStatus(true);
  };

  return { getStatus, start, stop, syncRemainingTime };
};
