using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

public class SettingsRepository(DbConnectionFactory db) : ISettingsRepository
{
    private readonly DbConnectionFactory _db = db;

    public async Task<SettingsEntity> GetAsync()
    {
        using var conn = _db.CreateConnection();
        var entity = await conn.QuerySingleOrDefaultAsync<SettingsEntity>("SELECT * FROM settings WHERE id = 1");
        if (entity == null) {
            // Seed row if missing for some reason
            await conn.ExecuteAsync("INSERT IGNORE INTO settings (id) VALUES (1)");
            entity = await conn.QuerySingleOrDefaultAsync<SettingsEntity>("SELECT * FROM settings WHERE id = 1");
        }
        return entity!;
    }

    public async Task<SettingsEntity> UpdateAsync(SettingsEntity settings)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            UPDATE settings SET theme = @Theme, pomodoro_focus_minutes = @PomodoroFocusMinutes, 
            pomodoro_break_minutes = @PomodoroBreakMinutes, pomodoro_rounds = @PomodoroRounds, 
            habit_grace_period_days = @HabitGracePeriodDays, language = @Language,
            timezone = @Timezone
            WHERE id = 1";
        await conn.ExecuteAsync(sql, settings);
        return await GetAsync();
    }
}
