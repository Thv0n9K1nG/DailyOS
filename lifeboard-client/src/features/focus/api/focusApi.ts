import api from '../../../lib/api';

export interface FocusSession {
  id: number;
  sessionType: 'stopwatch' | 'pomodoro';
  label?: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  sessionDate: string;
  splits?: string;
  createdAt: string;
}

export interface FocusSessionResponse {
  data: FocusSession[];
  totalDurationSeconds: number;
}

export type CreateFocusSessionPayload = {
  sessionType: 'stopwatch' | 'pomodoro';
  label?: string;
  startTime: string;
  endTime: string;
  splits?: string;
};

export const focusApi = {
  getAll: async (from: string, to: string, type?: string): Promise<FocusSessionResponse> => {
    const res = await api.get<FocusSessionResponse>('/focus-sessions', { params: { from, to, type } });
    return res.data;
  },
  create: async (data: CreateFocusSessionPayload): Promise<FocusSession> => {
    const res = await api.post<FocusSession>('/focus-sessions', data);
    return res.data;
  }
};
