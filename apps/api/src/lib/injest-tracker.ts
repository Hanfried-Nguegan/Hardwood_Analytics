import { JobState } from "../types/nba.types";

let state: JobState = {
  status: "idle",
  startedAt: null,
  result: null,
  error: null,
};

export function getJobState(): JobState {
  return state;
}

export function setJobState(update: Partial<JobState>): void {
  state = { ...state, ...update };
}
