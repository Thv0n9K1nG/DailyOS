using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Models.DTOs.Analytics;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Services;

public class AnalyticsService(DbConnectionFactory db) : IAnalyticsService
{
    private readonly DbConnectionFactory _db = db;

    // ── Weekly ────────────────────────────────────────────────────
    public async Task<WeeklyAnalyticsDto> GetWeeklyAsync(DateTime weekStart)
    {
        var weekEnd = weekStart.AddDays(6);
        using var conn = _db.CreateConnection();

        var from = weekStart.ToString("yyyy-MM-dd");
        var to = weekEnd.ToString("yyyy-MM-dd");

        // Tasks completed per day
        var taskRows = await conn.QueryAsync<(string day, int completed, int total)>(@"
            SELECT DATE_FORMAT(planned_date, '%Y-%m-%d') AS day,
                   SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS completed,
                   COUNT(*) AS total
            FROM tasks
            WHERE planned_date BETWEEN @From AND @To AND status != 'archived'
            GROUP BY DATE_FORMAT(planned_date, '%Y-%m-%d')", new { From = from, To = to });

        // Focus minutes per day
        var focusRows = await conn.QueryAsync<(string day, int minutes)>(@"
            SELECT DATE_FORMAT(session_date, '%Y-%m-%d') AS day,
                   ROUND(SUM(duration_seconds)/60) AS minutes
            FROM focus_sessions
            WHERE session_date BETWEEN @From AND @To
            GROUP BY DATE_FORMAT(session_date, '%Y-%m-%d')", new { From = from, To = to });

        // Habit checkins per day
        var habitRows = await conn.QueryAsync<(string day, int done, int total)>(@"
            SELECT DATE_FORMAT(hc.checkin_date, '%Y-%m-%d') AS day,
                   SUM(hc.is_completed) AS done,
                   COUNT(*) AS total
            FROM habit_checkins hc
            JOIN habits h ON h.id = hc.habit_id AND h.is_active = 1
            WHERE hc.checkin_date BETWEEN @From AND @To
            GROUP BY DATE_FORMAT(hc.checkin_date, '%Y-%m-%d')", new { From = from, To = to });

        // Mood per day
        var moodRows = await conn.QueryAsync<(string day, double score)>(@"
            SELECT DATE_FORMAT(entry_date, '%Y-%m-%d') AS day, AVG(score) AS score
            FROM mood_entries
            WHERE entry_date BETWEEN @From AND @To
            GROUP BY DATE_FORMAT(entry_date, '%Y-%m-%d')", new { From = from, To = to });

        var taskMap = taskRows.ToDictionary(r => r.day, r => r);
        var focusMap = focusRows.ToDictionary(r => r.day, r => r);
        var habitMap = habitRows.ToDictionary(r => r.day, r => r);
        var moodMap = moodRows.ToDictionary(r => r.day, r => r);

        var days = new List<DayAnalyticsDto>();
        for (int i = 0; i <= 6; i++)
        {
            var d = weekStart.AddDays(i).ToString("yyyy-MM-dd");
            taskMap.TryGetValue(d, out var t);
            focusMap.TryGetValue(d, out var f);
            habitMap.TryGetValue(d, out var h);
            moodMap.TryGetValue(d, out var m);
            days.Add(new DayAnalyticsDto
            {
                Date = d,
                CompletedTasks = t.completed,
                FocusMinutes = f.minutes,
                HabitsCompleted = h.done,
                HabitsTotal = h.total,
                MoodScore = m.day is not null ? Math.Round(m.score, 1) : null,
            });
        }

        var totalTasks = days.Sum(d => d.CompletedTasks + (taskMap.TryGetValue(d.Date, out var tx) ? tx.total - tx.completed : 0));
        var totalCompleted = days.Sum(d => d.CompletedTasks);
        var moodEntries = days.Where(d => d.MoodScore.HasValue).ToList();

        return new WeeklyAnalyticsDto
        {
            WeekStart = from,
            WeekEnd = to,
            Days = days,
            Summary = new WeeklySummaryDto
            {
                TotalCompletedTasks = totalCompleted,
                TotalFocusMinutes = days.Sum(d => d.FocusMinutes),
                CompletionRate = totalTasks > 0 ? Math.Round((double)totalCompleted / totalTasks, 3) : 0,
                AvgMoodScore = moodEntries.Any() ? Math.Round(moodEntries.Average(d => d.MoodScore!.Value), 1) : 0,
            }
        };
    }

    // ── Monthly ───────────────────────────────────────────────────
    public async Task<MonthlyAnalyticsDto> GetMonthlyAsync(int year, int month)
    {
        using var conn = _db.CreateConnection();
        var from = new DateTime(year, month, 1).ToString("yyyy-MM-dd");
        var to = new DateTime(year, month, DateTime.DaysInMonth(year, month)).ToString("yyyy-MM-dd");

        var taskRows = await conn.QueryAsync<(string day, int completed, int total)>(@"
            SELECT DATE_FORMAT(planned_date, '%Y-%m-%d') AS day,
                   SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS completed,
                   COUNT(*) AS total
            FROM tasks
            WHERE planned_date BETWEEN @From AND @To AND status != 'archived'
            GROUP BY DATE_FORMAT(planned_date, '%Y-%m-%d')", new { From = from, To = to });

        var focusRows = await conn.QueryAsync<(string day, int minutes)>(@"
            SELECT DATE_FORMAT(session_date, '%Y-%m-%d') AS day,
                   ROUND(SUM(duration_seconds)/60) AS minutes
            FROM focus_sessions
            WHERE session_date BETWEEN @From AND @To
            GROUP BY DATE_FORMAT(session_date, '%Y-%m-%d')", new { From = from, To = to });

        var habitRows = await conn.QueryAsync<(string day, int done)>(@"
            SELECT DATE_FORMAT(checkin_date, '%Y-%m-%d') AS day, SUM(is_completed) AS done
            FROM habit_checkins
            WHERE checkin_date BETWEEN @From AND @To
            GROUP BY DATE_FORMAT(checkin_date, '%Y-%m-%d')", new { From = from, To = to });

        var taskMap = taskRows.ToDictionary(r => r.day, r => r);
        var focusMap = focusRows.ToDictionary(r => r.day, r => r);
        var habitMap = habitRows.ToDictionary(r => r.day, r => r);

        int daysInMonth = DateTime.DaysInMonth(year, month);
        var days = new List<DayAnalyticsDto>();
        for (int i = 1; i <= daysInMonth; i++)
        {
            var d = new DateTime(year, month, i).ToString("yyyy-MM-dd");
            taskMap.TryGetValue(d, out var t);
            focusMap.TryGetValue(d, out var f);
            habitMap.TryGetValue(d, out var h);
            days.Add(new DayAnalyticsDto
            {
                Date = d,
                CompletedTasks = t.completed,
                FocusMinutes = f.minutes,
                HabitsCompleted = h.done,
            });
        }

        var totalCompleted = days.Sum(d => d.CompletedTasks);
        var totalAll = taskRows.Sum(r => r.total);

        return new MonthlyAnalyticsDto
        {
            Year = year,
            Month = month,
            Days = days,
            Summary = new MonthlySummaryDto
            {
                TotalCompletedTasks = totalCompleted,
                TotalFocusHours = Math.Round(days.Sum(d => d.FocusMinutes) / 60.0, 1),
                CompletionRate = totalAll > 0 ? Math.Round((double)totalCompleted / totalAll, 3) : 0,
            }
        };
    }

    // ── Yearly ────────────────────────────────────────────────────
    public async Task<YearlyAnalyticsDto> GetYearlyAsync(int year)
    {
        using var conn = _db.CreateConnection();

        // Aggregate all 3 sources
        var taskRows = await conn.QueryAsync<(string date, int count)>(@"
            SELECT DATE_FORMAT(DATE(completed_at), '%Y-%m-%d') AS date, COUNT(*) AS count
            FROM tasks WHERE YEAR(completed_at) = @Year AND status='done'
            GROUP BY DATE(completed_at)", new { Year = year });

        var focusRows = await conn.QueryAsync<(string date, int minutes)>(@"
            SELECT DATE_FORMAT(session_date, '%Y-%m-%d') AS date,
                   ROUND(SUM(duration_seconds)/60) AS minutes
            FROM focus_sessions WHERE YEAR(session_date) = @Year
            GROUP BY session_date", new { Year = year });

        var habitRows = await conn.QueryAsync<(string date, int done)>(@"
            SELECT DATE_FORMAT(checkin_date, '%Y-%m-%d') AS date, SUM(is_completed) AS done
            FROM habit_checkins WHERE YEAR(checkin_date) = @Year AND is_completed = 1
            GROUP BY checkin_date", new { Year = year });

        var taskMap = taskRows.ToDictionary(r => r.date, r => r.count);
        var focusMap = focusRows.ToDictionary(r => r.date, r => r.minutes);
        var habitMap = habitRows.ToDictionary(r => r.date, r => r.done);

        // Collect all unique dates
        var allDates = taskMap.Keys.Union(focusMap.Keys).Union(habitMap.Keys).ToHashSet();

        var heatmap = allDates.Select(date =>
        {
            taskMap.TryGetValue(date, out var tasks);
            focusMap.TryGetValue(date, out var focus);
            habitMap.TryGetValue(date, out var habits);
            var score = tasks + (focus / 30) + habits;
            int intensity = score == 0 ? 0 : score <= 2 ? 1 : score <= 5 ? 2 : score <= 10 ? 3 : 4;
            return new HeatmapDayDto
            {
                Date = date,
                TaskCount = tasks,
                FocusMinutes = focus,
                HabitDone = habits,
                IntensityLevel = intensity,
            };
        }).OrderBy(h => h.Date).ToList();

        return new YearlyAnalyticsDto { Year = year, Heatmap = heatmap };
    }

    // ── Statistics ────────────────────────────────────────────────
    public async Task<StatisticsDto> GetStatisticsAsync(DateTime from, DateTime to)
    {
        using var conn = _db.CreateConnection();
        var fromStr = from.ToString("yyyy-MM-dd");
        var toStr = to.ToString("yyyy-MM-dd");

        var taskRows = await conn.QueryAsync<(string priority, string status)>(@"
            SELECT priority, status FROM tasks
            WHERE planned_date BETWEEN @From AND @To AND status != 'archived'",
            new { From = fromStr, To = toStr });

        var focusRows = await conn.QueryAsync<(string sessionType, int duration)>(@"
            SELECT session_type, duration_seconds FROM focus_sessions
            WHERE session_date BETWEEN @From AND @To",
            new { From = fromStr, To = toStr });

        var moodRows = await conn.QueryAsync<int>(@"
            SELECT score FROM mood_entries WHERE entry_date BETWEEN @From AND @To",
            new { From = fromStr, To = toStr });

        var habitRows = await conn.QueryAsync<(int habitId, string habitName, int streak)>(@"
            SELECT h.id, h.name,
                (SELECT COUNT(*) FROM (
                    SELECT checkin_date, ROW_NUMBER() OVER (ORDER BY checkin_date DESC) AS rn,
                           DATEDIFF(CURDATE(), checkin_date) AS days_ago
                    FROM habit_checkins WHERE habit_id = h.id AND is_completed = 1
                ) sub WHERE days_ago = rn - 1) AS streak
            FROM habits h WHERE h.is_active = 1");

        var allTasks = taskRows.ToList();
        var allFocus = focusRows.ToList();
        var allMoods = moodRows.ToList();

        int totalTasks = allTasks.Count;
        int completedTasks = allTasks.Count(t => t.status == "done");
        int totalFocusSecs = allFocus.Sum(f => f.duration);
        int days = Math.Max(1, (int)(to - from).TotalDays + 1);

        var longestStreak = habitRows.OrderByDescending(h => h.streak).FirstOrDefault();

        return new StatisticsDto
        {
            Period = new PeriodDto { From = fromStr, To = toStr },
            Tasks = new TaskStatsDto
            {
                Total = totalTasks,
                Completed = completedTasks,
                CompletionRate = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks, 3) : 0,
                ByPriority = new Dictionary<string, int>
                {
                    ["high"] = allTasks.Count(t => t.priority == "high"),
                    ["medium"] = allTasks.Count(t => t.priority == "medium"),
                    ["low"] = allTasks.Count(t => t.priority == "low"),
                }
            },
            Focus = new FocusStatsDto
            {
                TotalSessions = allFocus.Count,
                TotalMinutes = totalFocusSecs / 60,
                AvgMinutesPerDay = Math.Round((double)(totalFocusSecs / 60) / days, 1),
                ByType = new Dictionary<string, int>
                {
                    ["stopwatch"] = allFocus.Count(f => f.sessionType == "stopwatch"),
                    ["pomodoro"] = allFocus.Count(f => f.sessionType == "pomodoro"),
                }
            },
            Habits = new HabitStatsDto
            {
                LongestStreak = longestStreak.habitId > 0
                    ? new LongestStreakDto { HabitName = longestStreak.habitName, Streak = longestStreak.streak }
                    : null,
                AvgCompletionRate = 0,
            },
            Mood = new MoodStatsDto
            {
                AvgScore = allMoods.Any() ? Math.Round(allMoods.Average(), 1) : 0,
                Distribution = Enumerable.Range(1, 5).ToDictionary(
                    s => s.ToString(),
                    s => allMoods.Count(m => m == s))
            }
        };
    }
}

