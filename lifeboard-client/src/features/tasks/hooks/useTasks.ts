import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, GetTasksParams, CreateTaskPayload, UpdateTaskPayload } from '../api/taskApi';

export const useTasks = (params?: GetTasksParams) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskApi.getAll(params),
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskPayload) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskPayload }) => taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUncompleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskApi.uncomplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
