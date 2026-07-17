namespace LifeBoard.API.Models.DTOs.Analytics;

public class DayAnalyticsDto
{
    public string Date { get; set; } = string.Empty;
    public int CompletedTasks { get; set; }
    public int FocusMinutes { get; set; }
    public int HabitsCompleted { get; set; }
    public int HabitsTotal { get; set; }
    public double? MoodScore { get; set; }
}

public class WeeklyAnalyticsDto
{
    public string WeekStart { get; set; } = string.Empty;
    public string WeekEnd { get; set; } = string.Empty;
    public List<DayAnalyticsDto> Days { get; set; } = new();
    public WeeklySummaryDto Summary { get; set; } = new();
}

public class WeeklySummaryDto
{
    public int TotalCompletedTasks { get; set; }
    public int TotalFocusMinutes { get; set; }
    public double CompletionRate { get; set; }
    public double AvgMoodScore { get; set; }
}

public class MonthlyAnalyticsDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public List<DayAnalyticsDto> Days { get; set; } = new();
    public MonthlySummaryDto Summary { get; set; } = new();
}

public class MonthlySummaryDto
{
    public int TotalCompletedTasks { get; set; }
    public double TotalFocusHours { get; set; }
    public double CompletionRate { get; set; }
}

public class HeatmapDayDto
{
    public string Date { get; set; } = string.Empty;
    public int TaskCount { get; set; }
    public int FocusMinutes { get; set; }
    public int HabitDone { get; set; }
    public int IntensityLevel { get; set; } // 0–4
}

public class YearlyAnalyticsDto
{
    public int Year { get; set; }
    public List<HeatmapDayDto> Heatmap { get; set; } = new();
}

public class StatisticsDto
{
    public PeriodDto Period { get; set; } = new();
    public TaskStatsDto Tasks { get; set; } = new();
    public FocusStatsDto Focus { get; set; } = new();
    public HabitStatsDto Habits { get; set; } = new();
    public MoodStatsDto Mood { get; set; } = new();
}

public class PeriodDto
{
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
}

public class TaskStatsDto
{
    public int Total { get; set; }
    public int Completed { get; set; }
    public double CompletionRate { get; set; }
    public Dictionary<string, int> ByPriority { get; set; } = new();
}

public class FocusStatsDto
{
    public int TotalSessions { get; set; }
    public int TotalMinutes { get; set; }
    public double AvgMinutesPerDay { get; set; }
    public Dictionary<string, int> ByType { get; set; } = new();
}

public class HabitStatsDto
{
    public LongestStreakDto? LongestStreak { get; set; }
    public double AvgCompletionRate { get; set; }
}

public class LongestStreakDto
{
    public string HabitName { get; set; } = string.Empty;
    public int Streak { get; set; }
}

public class MoodStatsDto
{
    public double AvgScore { get; set; }
    public Dictionary<string, int> Distribution { get; set; } = new();
}
