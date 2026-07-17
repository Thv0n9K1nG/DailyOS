import api from '../../../lib/api';

export interface DailyNote {
  id: number;
  noteDate: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertDailyNotePayload {
  noteDate: string;
  content: string;
}

export const noteApi = {
  getByDate: async (date: string): Promise<DailyNote> => {
    const res = await api.get<DailyNote>(`/daily-notes/date/${date}`);
    return res.data;
  },
  getAll: async (): Promise<DailyNote[]> => {
    const res = await api.get<DailyNote[]>('/daily-notes');
    return res.data;
  },
  upsert: async (data: UpsertDailyNotePayload): Promise<DailyNote> => {
    const res = await api.post<DailyNote>('/daily-notes', data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/daily-notes/${id}`);
  }
};
