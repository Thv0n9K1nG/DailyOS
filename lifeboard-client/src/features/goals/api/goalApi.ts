import api from '../../../lib/api';

export interface Goal {
  id: number;
  title: string;
  description?: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercent: number;
  deadline?: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline?: string;
}

export interface UpdateGoalPayload extends CreateGoalPayload {
  status: 'active' | 'completed' | 'paused';
}

export const goalApi = {
  getAll: async (status?: string): Promise<Goal[]> => {
    const res = await api.get<Goal[]>('/goals', { params: status ? { status } : {} });
    return res.data;
  },
  getById: async (id: number): Promise<Goal> => {
    const res = await api.get<Goal>(`/goals/${id}`);
    return res.data;
  },
  create: async (data: CreateGoalPayload): Promise<Goal> => {
    const res = await api.post<Goal>('/goals', data);
    return res.data;
  },
  update: async (id: number, data: UpdateGoalPayload): Promise<Goal> => {
    const res = await api.put<Goal>(`/goals/${id}`, data);
    return res.data;
  },
  updateProgress: async (id: number, currentValue: number): Promise<Goal> => {
    const res = await api.patch<Goal>(`/goals/${id}/progress`, { currentValue });
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/goals/${id}`);
  },
};
