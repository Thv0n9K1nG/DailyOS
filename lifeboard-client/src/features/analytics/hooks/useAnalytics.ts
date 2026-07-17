import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export const useMonthlyAnalytics = (year: number, month: number) => {
  return useQuery({
    queryKey: ['analytics', 'monthly', year, month],
    queryFn: () => analyticsApi.getMonthly(year, month),
    staleTime: 60_000,
  });
};

export const useYearlyAnalytics = (year: number) => {
  return useQuery({
    queryKey: ['analytics', 'yearly', year],
    queryFn: () => analyticsApi.getYearly(year),
    staleTime: 60_000,
  });
};

export const useWeeklyAnalytics = (weekStart?: string) => {
  return useQuery({
    queryKey: ['analytics', 'weekly', weekStart],
    queryFn: () => analyticsApi.getWeekly(weekStart),
    staleTime: 60_000,
  });
};
