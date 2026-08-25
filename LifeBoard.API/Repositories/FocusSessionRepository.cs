using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

public class FocusSessionRepository(DbConnectionFactory db) : IFocusSessionRepository
{
    private readonly DbConnectionFactory _db = db;

    public async Task<IEnumerable<FocusSessionEntity>> GetAllAsync(DateTime from, DateTime to)
    {
        using var conn = _db.CreateConnection();
        return await conn.QueryAsync<FocusSessionEntity>(
            "SELECT * FROM focus_sessions WHERE session_date >= @From AND session_date <= @To ORDER BY start_time DESC",
            new { From = from.ToString("yyyy-MM-dd"), To = to.ToString("yyyy-MM-dd") }
        );
    }

    public async Task<FocusSessionEntity?> GetByIdAsync(int id)
    {
        using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<FocusSessionEntity>("SELECT * FROM focus_sessions WHERE id = @Id", new { Id = id });
    }

    public async Task<FocusSessionEntity?> GetActiveStopwatchAsync()
    {
        using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<FocusSessionEntity>(
            "SELECT * FROM focus_sessions WHERE session_type = 'stopwatch' AND stopwatch_state IN ('running','paused') ORDER BY start_time DESC LIMIT 1");
    }

    public async Task<FocusSessionEntity> CreateAsync(FocusSessionEntity session)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            INSERT INTO focus_sessions
                (session_type, label, start_time, end_time, duration_seconds, session_date, splits, stopwatch_state, paused_duration_seconds, current_segment_start)
            VALUES
                (@SessionType, @Label, @StartTime, @EndTime, @DurationSeconds, @SessionDate, @Splits, @StopwatchState, @PausedDurationSeconds, @CurrentSegmentStart);
            SELECT LAST_INSERT_ID();";
        var id = await conn.ExecuteScalarAsync<int>(sql, session);
        return await conn.QuerySingleOrDefaultAsync<FocusSessionEntity>("SELECT * FROM focus_sessions WHERE id = @Id", new { Id = id });
    }

    public async Task<FocusSessionEntity> UpdateAsync(FocusSessionEntity session)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            UPDATE focus_sessions
            SET session_type          = @SessionType,
                label                 = @Label,
                start_time            = @StartTime,
                end_time              = @EndTime,
                duration_seconds      = @DurationSeconds,
                session_date          = @SessionDate,
                splits                = @Splits,
                stopwatch_state       = @StopwatchState,
                paused_duration_seconds = @PausedDurationSeconds,
                current_segment_start = @CurrentSegmentStart
            WHERE id = @Id;";
        await conn.ExecuteAsync(sql, session);
        return session;
    }

    public async Task DeleteAsync(int id)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync("DELETE FROM focus_sessions WHERE id = @Id", new { Id = id });
    }
}

