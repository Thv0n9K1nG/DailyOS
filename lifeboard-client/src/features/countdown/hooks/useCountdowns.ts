import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { countdownApi, CreateCountdownPayload, UpdateCountdownPayload } from '../api/countdownApi';

export const useCountdowns = () => {
  return useQuery({
    queryKey: ['countdowns'],
    queryFn: countdownApi.getAll,
  });
};

export const useCreateCountdown = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCountdownPayload) => countdownApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdowns'] });
    },
  });
};

export const useUpdateCountdown = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCountdownPayload }) => countdownApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdowns'] });
    },
  });
};

export const useDeleteCountdown = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => countdownApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdowns'] });
    },
  });
};
