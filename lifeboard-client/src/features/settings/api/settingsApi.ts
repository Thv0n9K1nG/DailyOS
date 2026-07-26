import api from '../../../lib/api';

export interface Settings {
  theme: 'light' | 'dark';
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroRounds: number;
  habitGracePeriodDays: number;
  language: string;
  timezone: string;
}

export const settingsApi = {
  get: async (): Promise<Settings> => {
    const res = await api.get<Settings>('/settings');
    return res.data;
  },
  update: async (data: Settings): Promise<Settings> => {
    const res = await api.put<Settings>('/settings', data);
    return res.data;
  }
};
