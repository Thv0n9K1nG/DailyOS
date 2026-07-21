using Dapper;
using LifeBoard.Infrastructure;
using LifeBoard.Models;

namespace LifeBoard.Repositories;

public class CountdownRepo(DbConnectionFactory db)
{
    private static readonly string SelectAll = "SELECT * FROM countdowns ORDER BY target_date ASC";

    public async Task<IEnumerable<Countdown>> GetAllAsync()
    {
        await using var c = db.CreateConnection();
        return await c.QueryAsync<Countdown>(SelectAll);
    }

    public async Task<Countdown?> GetByIdAsync(int id)
    {
        await using var c = db.CreateConnection();
        return await c.QuerySingleOrDefaultAsync<Countdown>(
            "SELECT * FROM countdowns WHERE id = @id", new { id });
    }

    public async Task<Countdown> CreateAsync(Countdown item)
    {
        await using var c = db.CreateConnection();
        var id = await c.ExecuteScalarAsync<int>(@"
            INSERT INTO countdowns (title, target_date, icon, color)
            VALUES (@Title, @TargetDate, @Icon, @Color);
            SELECT LAST_INSERT_ID();", item);
        return (await GetByIdAsync(id))!;
    }

    public async Task<Countdown> UpdateAsync(Countdown item)
    {
        await using var c = db.CreateConnection();
        await c.ExecuteAsync(@"
            UPDATE countdowns SET title=@Title, target_date=@TargetDate, icon=@Icon, color=@Color
            WHERE id=@Id", item);
        return (await GetByIdAsync(item.Id))!;
    }

    public async Task DeleteAsync(int id)
    {
        await using var c = db.CreateConnection();
        await c.ExecuteAsync("DELETE FROM countdowns WHERE id=@id", new { id });
    }
}

public class TaskRepo(DbConnectionFactory db)
{
    public async Task<IEnumerable<TaskItem>> GetByDateAsync(DateOnly date)
    {
        await using var c = db.CreateConnection();
        return await c.QueryAsync<TaskItem>(
            "SELECT * FROM tasks WHERE planned_date = @date ORDER BY priority DESC, created_at",
            new { date });
    }

    public async Task<IEnumerable<TaskItem>> GetByMonthAsync(int year, int month)
    {
        await using var c = db.CreateConnection();
        return await c.QueryAsync<TaskItem>(
            "SELECT * FROM tasks WHERE YEAR(planned_date)=@year AND MONTH(planned_date)=@month",
            new { year, month });
    }

    public async Task<TaskItem?> GetByIdAsync(int id)
    {
        await using var c = db.CreateConnection();
        return await c.QuerySingleOrDefaultAsync<TaskItem>(
            "SELECT * FROM tasks WHERE id=@id", new { id });
    }

    public async Task<TaskItem> CreateAsync(TaskItem item)
    {
        await using var c = db.CreateConnection();
        var id = await c.ExecuteScalarAsync<int>(@"
            INSERT INTO tasks (title, note, priority, status, planned_date)
            VALUES (@Title, @Note, @Priority, @Status, @PlannedDate);
            SELECT LAST_INSERT_ID();", item);
        return (await GetByIdAsync(id))!;
    }

    public async Task<TaskItem> UpdateStatusAsync(int id, string status)
    {
        await using var c = db.CreateConnection();
        var completedAt = status == "done" ? (object)DateTime.UtcNow : DBNull.Value;
        await c.ExecuteAsync(@"
            UPDATE tasks SET status=@status, completed_at=@completedAt WHERE id=@id",
            new { status, completedAt, id });
        return (await GetByIdAsync(id))!;
    }

    public async Task DeleteAsync(int id)
    {
        await using var c = db.CreateConnection();
        await c.ExecuteAsync("DELETE FROM tasks WHERE id=@id", new { id });
    }
}

public class HabitRepo(DbConnectionFactory db)
{
    public async Task<IEnumerable<Habit>> GetAllActiveAsync()
    {
        await using var c = db.CreateConnection();
        return await c.QueryAsync<Habit>(
            "SELECT * FROM habits WHERE is_active=1 ORDER BY created_at");
    }

    public async Task<Habit?> GetByIdAsync(int id)
    {
        await using var c = db.CreateConnection();
        return await c.QuerySingleOrDefaultAsync<Habit>(
            "SELECT * FROM habits WHERE id=@id", new { id });
    }

    public async Task<Habit> CreateAsync(Habit item)
    {
        await using var c = db.CreateConnection();
        var id = await c.ExecuteScalarAsync<int>(@"
            INSERT INTO habits (name, description, icon, color)
            VALUES (@Name, @Description, @Icon, @Color);
            SELECT LAST_INSERT_ID();", item);
        return (await GetByIdAsync(id))!;
    }

    public async Task DeleteAsync(int id)
    {
        await using var c = db.CreateConnection();
        await c.ExecuteAsync("UPDATE habits SET is_active=0 WHERE id=@id", new { id });
    }

    public async Task<IEnumerable<HabitLog>> GetLogsForDateAsync(DateOnly date)
    {
        await using var c = db.CreateConnection();
        return await c.QueryAsync<HabitLog>(
            "SELECT * FROM habit_logs WHERE log_date=@date", new { date });
    }

    public async Task UpsertLogAsync(int habitId, DateOnly date, bool done)
    {
        await using var c = db.CreateConnection();
        await c.ExecuteAsync(@"
            INSERT INTO habit_logs (habit_id, log_date, done) VALUES (@habitId, @date, @done)
            ON DUPLICATE KEY UPDATE done=@done", new { habitId, date, done });
    }
}

public class GoalRepo(DbConnectionFactory db)
{
    public async Task<IEnumerable<Goal>> GetAllAsync()
    {
        await using var c = db.CreateConnection();
        return await c.QueryAsync<Goal>(
            "SELECT * FROM goals ORDER BY created_at DESC");
    }

    public async Task<Goal?> GetByIdAsync(int id)
    {
        await using var c = db.CreateConnection();
        return await c.QuerySingleOrDefaultAsync<Goal>(
            "SELECT * FROM goals WHERE id=@id", new { id });
    }

    public async Task<Goal> CreateAsync(Goal item)
    {
        await using var c = db.CreateConnection();
        var id = await c.ExecuteScalarAsync<int>(@"
            INSERT INTO goals (title, description, target_value, unit, deadline, current_value, status)
            VALUES (@Title, @Description, @TargetValue, @Unit, @Deadline, @CurrentValue, @Status);
            SELECT LAST_INSERT_ID();", item);
        return (await GetByIdAsync(id))!;
    }

    public async Task<Goal> UpdateProgressAsync(int id, decimal value)
    {
        await using var c = db.CreateConnection();
        var status = await c.QuerySingleOrDefaultAsync<Goal>("SELECT * FROM goals WHERE id=@id", new { id });
        var newStatus = status != null && value >= status.TargetValue ? "completed" : "active";
        await c.ExecuteAsync(
            "UPDATE goals SET current_value=@value, status=@newStatus WHERE id=@id",
            new { value, newStatus, id });
        return (await GetByIdAsync(id))!;
    }

    public async Task DeleteAsync(int id)
    {
        await using var c = db.CreateConnection();
        await c.ExecuteAsync("DELETE FROM goals WHERE id=@id", new { id });
    }
}

public class FocusRepo(DbConnectionFactory db)
{
    public async Task<IEnumerable<FocusSession>> GetByDateAsync(DateOnly date)
    {
        await using var c = db.CreateConnection();
        return await c.QueryAsync<FocusSession>(
            "SELECT * FROM focus_sessions WHERE session_date=@date ORDER BY start_time DESC",
            new { date });
    }

    public async Task<FocusSession?> GetByIdAsync(int id)
    {
        await using var c = db.CreateConnection();
        return await c.QuerySingleOrDefaultAsync<FocusSession>(
            "SELECT * FROM focus_sessions WHERE id=@id", new { id });
    }

    public async Task<FocusSession> CreateAsync(FocusSession item)
    {
        await using var c = db.CreateConnection();
        var duration = (int)(item.EndTime - item.StartTime).TotalSeconds;
        var id = await c.ExecuteScalarAsync<int>(@"
            INSERT INTO focus_sessions (label, session_date, start_time, end_time, duration_seconds, splits)
            VALUES (@Label, @SessionDate, @StartTime, @EndTime, @Duration, @Splits);
            SELECT LAST_INSERT_ID();",
            new { item.Label, item.SessionDate, item.StartTime, item.EndTime, Duration = duration, item.Splits });
        return (await GetByIdAsync(id))!;
    }

    public async Task<FocusSession> UpdateAsync(int id, FocusSessionUpdateRequest req)
    {
        await using var c = db.CreateConnection();
        var duration = (int)(req.EndTime - req.StartTime).TotalSeconds;
        await c.ExecuteAsync(@"
            UPDATE focus_sessions SET label=@Label, start_time=@StartTime, end_time=@EndTime,
            duration_seconds=@Duration, splits=@Splits WHERE id=@id",
            new { req.Label, req.StartTime, req.EndTime, Duration = duration, req.Splits, id });
        return (await GetByIdAsync(id))!;
    }

    public async Task DeleteAsync(int id)
    {
        await using var c = db.CreateConnection();
        await c.ExecuteAsync("DELETE FROM focus_sessions WHERE id=@id", new { id });
    }

    public async Task<int> GetTotalSecondsByDateAsync(DateOnly date)
    {
        await using var c = db.CreateConnection();
        return await c.ExecuteScalarAsync<int>(
            "SELECT COALESCE(SUM(duration_seconds),0) FROM focus_sessions WHERE session_date=@date",
            new { date });
    }
}

public class NoteRepo(DbConnectionFactory db)
{
    public async Task<DailyNote?> GetByDateAsync(DateOnly date)
    {
        await using var c = db.CreateConnection();
        return await c.QuerySingleOrDefaultAsync<DailyNote>(
            "SELECT * FROM daily_notes WHERE note_date=@date", new { date });
    }

    public async Task<DailyNote> UpsertAsync(DateOnly date, string? content)
    {
        await using var c = db.CreateConnection();
        await c.ExecuteAsync(@"
            INSERT INTO daily_notes (note_date, content) VALUES (@date, @content)
            ON DUPLICATE KEY UPDATE content=@content", new { date, content });
        return (await GetByDateAsync(date))!;
    }
}

public class MoodRepo(DbConnectionFactory db)
{
    public async Task<IEnumerable<MoodEntry>> GetRangeAsync(DateOnly from, DateOnly to)
    {
        await using var c = db.CreateConnection();
        return await c.QueryAsync<MoodEntry>(
            "SELECT * FROM mood_entries WHERE entry_date BETWEEN @from AND @to ORDER BY entry_date",
            new { from, to });
    }

    public async Task<MoodEntry?> GetByDateAsync(DateOnly date)
    {
        await using var c = db.CreateConnection();
        return await c.QuerySingleOrDefaultAsync<MoodEntry>(
            "SELECT * FROM mood_entries WHERE entry_date=@date", new { date });
    }

    public async Task<MoodEntry> UpsertAsync(DateOnly date, int score, string? note)
    {
        await using var c = db.CreateConnection();
        await c.ExecuteAsync(@"
            INSERT INTO mood_entries (entry_date, score, note) VALUES (@date, @score, @note)
            ON DUPLICATE KEY UPDATE score=@score, note=@note", new { date, score, note });
        return (await GetByDateAsync(date))!;
    }
}

public class AnalyticsRepo(DbConnectionFactory db)
{
    public async Task<IEnumerable<(DateOnly Date, int FocusSec, int TasksDone, int Mood)>> GetStatsAsync(DateOnly from, DateOnly to)
    {
        await using var c = db.CreateConnection();
        var rows = await c.QueryAsync(@"
            SELECT
                d.dt AS Date,
                COALESCE(f.total_sec, 0) AS FocusSec,
                COALESCE(t.done_count, 0) AS TasksDone,
                COALESCE(m.score, 0) AS Mood
            FROM (
                SELECT DATE_ADD(@from, INTERVAL seq DAY) AS dt
                FROM (
                    SELECT @rownum := @rownum + 1 AS seq
                    FROM information_schema.columns, (SELECT @rownum := -1) r
                    LIMIT 366
                ) nums
                WHERE DATE_ADD(@from, INTERVAL seq DAY) <= @to
            ) d
            LEFT JOIN (
                SELECT session_date, SUM(duration_seconds) AS total_sec
                FROM focus_sessions GROUP BY session_date
            ) f ON f.session_date = d.dt
            LEFT JOIN (
                SELECT planned_date, COUNT(*) AS done_count
                FROM tasks WHERE status='done' GROUP BY planned_date
            ) t ON t.planned_date = d.dt
            LEFT JOIN mood_entries m ON m.entry_date = d.dt
            ORDER BY d.dt",
            new { from, to });

        return rows.Select(r => (
            Date: DateOnly.FromDateTime((DateTime)r.Date),
            FocusSec: (int)r.FocusSec,
            TasksDone: (int)r.TasksDone,
            Mood: (int)r.Mood));
    }
}
