import api from '../../../lib/api';

export interface Countdown {
  id: number;
  title: string;
  targetDate: string;
  daysRemaining: number;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCountdownPayload = Omit<Countdown, 'id' | 'daysRemaining' | 'createdAt' | 'updatedAt'>;
export type UpdateCountdownPayload = CreateCountdownPayload;

export const countdownApi = {
  getAll: async (): Promise<Countdown[]> => {
    const res = await api.get<Countdown[]>('/countdowns');
    return res.data;
  },
  create: async (data: CreateCountdownPayload): Promise<Countdown> => {
    const res = await api.post<Countdown>('/countdowns', data);
    return res.data;
  },
  update: async (id: number, data: UpdateCountdownPayload): Promise<Countdown> => {
    const res = await api.put<Countdown>(`/countdowns/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/countdowns/${id}`);
  }
};
