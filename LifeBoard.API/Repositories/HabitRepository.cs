using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

public class HabitRepository(DbConnectionFactory db) : IHabitRepository
{
    private readonly DbConnectionFactory _db = db;

    public async Task<IEnumerable<HabitEntity>> GetAllActiveAsync()
    {
        using var conn = _db.CreateConnection();
        return await conn.QueryAsync<HabitEntity>("SELECT * FROM habits WHERE is_active = 1");
    }

    public async Task<HabitEntity?> GetByIdAsync(int id)
    {
        using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<HabitEntity>("SELECT * FROM habits WHERE id = @Id", new { Id = id });
    }

    public async Task<HabitEntity> CreateAsync(HabitEntity habit)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            INSERT INTO habits (name, description, frequency, icon, color) 
            VALUES (@Name, @Description, @Frequency, @Icon, @Color); 
            SELECT LAST_INSERT_ID();";
        var id = await conn.ExecuteScalarAsync<int>(sql, habit);
        return await GetByIdAsync(id) ?? throw new Exception("Failed to retrieve created habit.");
    }

    public async Task<HabitEntity> UpdateAsync(HabitEntity habit)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            UPDATE habits SET name = @Name, description = @Description, 
            frequency = @Frequency, icon = @Icon, color = @Color 
            WHERE id = @Id";
        await conn.ExecuteAsync(sql, habit);
        return await GetByIdAsync(habit.Id) ?? throw new Exception("Failed to retrieve updated habit.");
    }

    public async Task DeleteAsync(int id)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync("DELETE FROM habits WHERE id = @Id", new { Id = id });
    }

    public async Task DeactivateAsync(int id)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync("UPDATE habits SET is_active = 0 WHERE id = @Id", new { Id = id });
    }

    public async Task<IEnumerable<HabitCheckInEntity>> GetCheckinsAsync(int habitId, DateTime from, DateTime to)
    {
        using var conn = _db.CreateConnection();
        return await conn.QueryAsync<HabitCheckInEntity>(
            "SELECT * FROM habit_checkins WHERE habit_id = @HabitId AND checkin_date >= @From AND checkin_date <= @To ORDER BY checkin_date DESC",
            new { HabitId = habitId, From = from.ToString("yyyy-MM-dd"), To = to.ToString("yyyy-MM-dd") }
        );
    }

    public async Task UpsertCheckinAsync(int habitId, DateTime date, bool isCompleted)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            INSERT INTO habit_checkins (habit_id, checkin_date, is_completed)
            VALUES (@HabitId, @CheckinDate, @IsCompleted)
            ON DUPLICATE KEY UPDATE is_completed = @IsCompleted";
        await conn.ExecuteAsync(sql, new { HabitId = habitId, CheckinDate = date.ToString("yyyy-MM-dd"), IsCompleted = isCompleted });
    }
}
