import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitApi, CreateHabitPayload, UpdateHabitPayload } from '../api/habitApi';

export const useHabits = () => {
  return useQuery({
    queryKey: ['habits'],
    queryFn: habitApi.getAll,
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHabitPayload) => habitApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHabitPayload }) => habitApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => habitApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useCheckinHabit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, isCompleted }: { id: number; date: string; isCompleted: boolean }) => 
      habitApi.checkin(id, date, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};
