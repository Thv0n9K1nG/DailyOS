import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, Settings } from '../api/settingsApi';

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Settings) => settingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
