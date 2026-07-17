import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalApi, CreateGoalPayload, UpdateGoalPayload } from '../api/goalApi';

export const GOALS_KEY = ['goals'] as const;

export const useGoals = (status?: string) => {
  return useQuery({
    queryKey: [...GOALS_KEY, status],
    queryFn: () => goalApi.getAll(status),
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoalPayload) => goalApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGoalPayload }) =>
      goalApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
};

export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, currentValue }: { id: number; currentValue: number }) =>
      goalApi.updateProgress(id, currentValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => goalApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GOALS_KEY });
    },
  });
};
