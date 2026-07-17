import api from '../../../lib/api';

export interface DayAnalytics {
  date: string;
  completedTasks: number;
  focusMinutes: number;
  habitsCompleted: number;
  habitsTotal: number;
  moodScore?: number;
}

export interface WeeklyAnalytics {
  weekStart: string;
  weekEnd: string;
  days: DayAnalytics[];
  summary: {
    totalCompletedTasks: number;
    totalFocusMinutes: number;
    completionRate: number;
    avgMoodScore: number;
  };
}

export interface MonthlyAnalytics {
  year: number;
  month: number;
  days: DayAnalytics[];
  summary: {
    totalCompletedTasks: number;
    totalFocusHours: number;
    completionRate: number;
  };
}

export interface HeatmapDay {
  date: string;
  taskCount: number;
  focusMinutes: number;
  habitDone: number;
  intensityLevel: number; // 0-4
}

export interface YearlyAnalytics {
  year: number;
  heatmap: HeatmapDay[];
}

export const analyticsApi = {
  getWeekly: async (weekStart?: string): Promise<WeeklyAnalytics> => {
    const res = await api.get<WeeklyAnalytics>('/analytics/weekly', {
      params: weekStart ? { weekStart } : {}
    });
    return res.data;
  },
  getMonthly: async (year: number, month: number): Promise<MonthlyAnalytics> => {
    const res = await api.get<MonthlyAnalytics>('/analytics/monthly', { params: { year, month } });
    return res.data;
  },
  getYearly: async (year: number): Promise<YearlyAnalytics> => {
    const res = await api.get<YearlyAnalytics>('/analytics/yearly', { params: { year } });
    return res.data;
  },
};
