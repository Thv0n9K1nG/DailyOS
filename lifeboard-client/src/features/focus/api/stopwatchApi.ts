import api from '../../../lib/api';

// ── Response shape from GET /stopwatch/current ───────────────────────────────

/**
 * Authoritative state from the server.
 *
 * React uses this to reconstruct the clock display:
 *   - state = "running": elapsed = accumulatedSeconds + (Date.now()/1000 - segmentStartedAt_unix)
 *   - state = "paused":  elapsed = accumulatedSeconds  (static, no tick)
 *   - state = null/204:  no active session (idle)
 */
export interface StopwatchState {
  id: number;
  state: 'running' | 'paused' | 'stopped';
  label?: string;
  /** UTC ISO string — the moment this current running segment started */
  segmentStartedAt?: string;
  /** Seconds already elapsed before the current segment */
  accumulatedSeconds: number;
  splits?: string;
  sessionDate?: string;
}

export interface StartStopwatchPayload {
  label?: string;
  sessionDate?: string;
}

export interface StopwatchSplitPayload {
  note?: string;
}

export const stopwatchApi = {
  /**
   * GET /stopwatch/current
   * Returns null when no active session (204 No Content).
   */
  getCurrent: async (): Promise<StopwatchState | null> => {
    const res = await api.get<StopwatchState>('/stopwatch/current', {
      validateStatus: (s) => s === 200 || s === 204,
    });
    return res.status === 204 ? null : res.data;
  },

  /** POST /stopwatch/start — begin a new session */
  start: async (payload: StartStopwatchPayload): Promise<StopwatchState> => {
    const res = await api.post<StopwatchState>('/stopwatch/start', payload);
    return res.data;
  },

  /** POST /stopwatch/pause — pause running session */
  pause: async (): Promise<StopwatchState> => {
    const res = await api.post<StopwatchState>('/stopwatch/pause');
    return res.data;
  },

  /** POST /stopwatch/resume — resume paused session */
  resume: async (): Promise<StopwatchState> => {
    const res = await api.post<StopwatchState>('/stopwatch/resume');
    return res.data;
  },

  /** POST /stopwatch/stop — finalize session, moves to history */
  stop: async (): Promise<StopwatchState> => {
    const res = await api.post<StopwatchState>('/stopwatch/stop');
    return res.data;
  },

  /** POST /stopwatch/split — add split marker */
  split: async (payload: StopwatchSplitPayload = {}): Promise<StopwatchState> => {
    const res = await api.post<StopwatchState>('/stopwatch/split', payload);
    return res.data;
  },

  /** PATCH /stopwatch/label — update label without changing state */
  updateLabel: async (label: string): Promise<StopwatchState> => {
    const res = await api.patch<StopwatchState>('/stopwatch/label', { label });
    return res.data;
  },
};
