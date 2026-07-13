import api from '../../../lib/api';
import { Tag } from '../../tags/api/tagApi';

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'done' | 'archived';
  deadline?: string;
  isRecurring: boolean;
  recurrenceType?: string;
  recurrenceEndDate?: string;
  plannedDate?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
  tags: Tag[];
}

export interface TaskListResponse {
  data: Task[];
  total: number;
}

export interface GetTasksParams {
  status?: string;
  priority?: string;
  plannedDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  plannedDate?: string;
  isRecurring: boolean;
  recurrenceType?: string;
  recurrenceEndDate?: string;
  tagIds: number[];
}

export type UpdateTaskPayload = CreateTaskPayload;

export const taskApi = {
  getAll: async (params?: GetTasksParams): Promise<TaskListResponse> => {
    const res = await api.get<TaskListResponse>('/tasks', { params });
    return res.data;
  },
  getById: async (id: number): Promise<Task> => {
    const res = await api.get<Task>(`/tasks/${id}`);
    return res.data;
  },
  create: async (data: CreateTaskPayload): Promise<Task> => {
    const res = await api.post<Task>('/tasks', data);
    return res.data;
  },
  update: async (id: number, data: UpdateTaskPayload): Promise<Task> => {
    const res = await api.put<Task>(`/tasks/${id}`, data);
    return res.data;
  },
  complete: async (id: number): Promise<Task> => {
    const res = await api.patch<Task>(`/tasks/${id}/complete`);
    return res.data;
  },
  uncomplete: async (id: number): Promise<Task> => {
    const res = await api.patch<Task>(`/tasks/${id}/uncomplete`);
    return res.data;
  },
  archive: async (id: number): Promise<Task> => {
    const res = await api.patch<Task>(`/tasks/${id}/archive`);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  }
};
