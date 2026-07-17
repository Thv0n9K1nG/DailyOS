import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moodApi, UpsertMoodPayload } from '../api/moodApi';

export const useMoodEntry = (date: string) => {
  return useQuery({
    queryKey: ['mood-entries', date],
    queryFn: () => moodApi.getByDate(date),
    retry: false,
  });
};

export const useAllMoodEntries = () => {
  return useQuery({
    queryKey: ['mood-entries'],
    queryFn: moodApi.getAll,
  });
};

export const useUpsertMoodEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertMoodPayload) => moodApi.upsert(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mood-entries'] });
      queryClient.invalidateQueries({ queryKey: ['mood-entries', variables.entryDate] });
    },
  });
};
