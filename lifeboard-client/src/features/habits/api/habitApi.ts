import api from '../../../lib/api';

export interface Habit {
  id: number;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  icon: string;
  color: string;
  isActive: boolean;
  streak: number;
  checkedInToday: boolean;
  createdAt: string;
}

export type CreateHabitPayload = Omit<Habit, 'id' | 'isActive' | 'streak' | 'checkedInToday' | 'createdAt'>;
export type UpdateHabitPayload = CreateHabitPayload;

export const habitApi = {
  getAll: async (): Promise<Habit[]> => {
    const res = await api.get<Habit[]>('/habits');
    return res.data;
  },
  create: async (data: CreateHabitPayload): Promise<Habit> => {
    const res = await api.post<Habit>('/habits', data);
    return res.data;
  },
  update: async (id: number, data: UpdateHabitPayload): Promise<Habit> => {
    const res = await api.put<Habit>(`/habits/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/habits/${id}`);
  },
  checkin: async (id: number, date: string, isCompleted: boolean): Promise<void> => {
    await api.post(`/habits/${id}/checkins`, { date, isCompleted });
  }
};
