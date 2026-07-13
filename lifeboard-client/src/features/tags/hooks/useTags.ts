import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagApi, Tag, CreateTagPayload, UpdateTagPayload } from '../api/tagApi';

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: tagApi.getAll,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTagPayload) => tagApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTagPayload }) => tagApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Tags in tasks might change
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tagApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
