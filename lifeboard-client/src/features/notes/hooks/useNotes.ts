import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteApi, UpsertDailyNotePayload } from '../api/noteApi';

export const useDailyNote = (date: string) => {
  return useQuery({
    queryKey: ['daily-notes', date],
    queryFn: () => noteApi.getByDate(date),
    retry: false, // If 404, we don't retry, just return no note
  });
};

export const useAllDailyNotes = () => {
  return useQuery({
    queryKey: ['daily-notes'],
    queryFn: noteApi.getAll,
  });
};

export const useUpsertDailyNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertDailyNotePayload) => noteApi.upsert(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daily-notes'] });
      queryClient.invalidateQueries({ queryKey: ['daily-notes', variables.noteDate] });
    },
  });
};
