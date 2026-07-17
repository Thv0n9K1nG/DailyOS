import api from '../../../lib/api';

export interface MoodEntry {
  id: number;
  entryDate: string;
  score: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertMoodPayload {
  entryDate: string;
  score: number;
  note?: string;
}

export const moodApi = {
  getByDate: async (date: string): Promise<MoodEntry> => {
    const res = await api.get<MoodEntry>(`/mood-entries/date/${date}`);
    return res.data;
  },
  getAll: async (): Promise<MoodEntry[]> => {
    const res = await api.get<MoodEntry[]>('/mood-entries');
    return res.data;
  },
  upsert: async (data: UpsertMoodPayload): Promise<MoodEntry> => {
    const res = await api.post<MoodEntry>('/mood-entries', data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/mood-entries/${id}`);
  }
};
