import api from '../../../lib/api';

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export type CreateTagPayload = Omit<Tag, 'id'>;
export type UpdateTagPayload = Omit<Tag, 'id'>;

export const tagApi = {
  getAll: async (): Promise<Tag[]> => {
    const res = await api.get<Tag[]>('/tags');
    return res.data;
  },
  create: async (data: CreateTagPayload): Promise<Tag> => {
    const res = await api.post<Tag>('/tags', data);
    return res.data;
  },
  update: async (id: number, data: UpdateTagPayload): Promise<Tag> => {
    const res = await api.put<Tag>(`/tags/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/tags/${id}`);
  }
};
