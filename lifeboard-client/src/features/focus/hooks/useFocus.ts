import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { focusApi, CreateFocusSessionPayload } from '../api/focusApi';

export const useFocusSessions = (from: string, to: string, type?: string) => {
  return useQuery({
    queryKey: ['focus-sessions', from, to, type],
    queryFn: () => focusApi.getAll(from, to, type),
  });
};

export const useCreateFocusSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFocusSessionPayload) => focusApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
    },
  });
};
