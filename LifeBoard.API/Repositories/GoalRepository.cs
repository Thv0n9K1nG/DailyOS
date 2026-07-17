using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

public class GoalRepository(DbConnectionFactory db) : IGoalRepository
{
    private readonly DbConnectionFactory _db = db;

    public async Task<IEnumerable<GoalEntity>> GetAllAsync(string? status = null)
    {
        using var conn = _db.CreateConnection();
        if (status is not null)
        {
            return await conn.QueryAsync<GoalEntity>(
                "SELECT * FROM goals WHERE status = @Status ORDER BY created_at DESC",
                new { Status = status });
        }
        return await conn.QueryAsync<GoalEntity>(
            "SELECT * FROM goals ORDER BY created_at DESC");
    }

    public async Task<GoalEntity?> GetByIdAsync(int id)
    {
        using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<GoalEntity>(
            "SELECT * FROM goals WHERE id = @Id", new { Id = id });
    }

    public async Task<GoalEntity> CreateAsync(GoalEntity goal)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            INSERT INTO goals (title, description, current_value, target_value, unit, deadline, status)
            VALUES (@Title, @Description, @CurrentValue, @TargetValue, @Unit, @Deadline, @Status);
            SELECT LAST_INSERT_ID();";
        var id = await conn.ExecuteScalarAsync<int>(sql, goal);
        return await GetByIdAsync(id) ?? throw new Exception("Failed to retrieve created goal.");
    }

    public async Task<GoalEntity> UpdateAsync(GoalEntity goal)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            UPDATE goals
            SET title = @Title, description = @Description, current_value = @CurrentValue,
                target_value = @TargetValue, unit = @Unit, deadline = @Deadline, status = @Status
            WHERE id = @Id";
        await conn.ExecuteAsync(sql, goal);
        return await GetByIdAsync(goal.Id) ?? throw new Exception("Failed to retrieve updated goal.");
    }

    public async Task DeleteAsync(int id)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync("DELETE FROM goals WHERE id = @Id", new { Id = id });
    }
}
