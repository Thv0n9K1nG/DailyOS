using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

public class CountdownRepository(DbConnectionFactory db) : ICountdownRepository
{
    private readonly DbConnectionFactory _db = db;

    public async Task<IEnumerable<CountdownEntity>> GetAllAsync()
    {
        using var conn = _db.CreateConnection();
        return await conn.QueryAsync<CountdownEntity>("SELECT * FROM countdowns ORDER BY target_date ASC");
    }

    public async Task<CountdownEntity?> GetByIdAsync(int id)
    {
        using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<CountdownEntity>("SELECT * FROM countdowns WHERE id = @Id", new { Id = id });
    }

    public async Task<CountdownEntity> CreateAsync(CountdownEntity countdown)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            INSERT INTO countdowns (title, target_date, icon, color)
            VALUES (@Title, @TargetDate, @Icon, @Color);
            SELECT LAST_INSERT_ID();";
        var id = await conn.ExecuteScalarAsync<int>(sql, countdown);
        return await GetByIdAsync(id) ?? throw new Exception("Failed to retrieve created countdown.");
    }

    public async Task<CountdownEntity> UpdateAsync(CountdownEntity countdown)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            UPDATE countdowns SET title = @Title, target_date = @TargetDate, icon = @Icon, color = @Color
            WHERE id = @Id";
        await conn.ExecuteAsync(sql, countdown);
        return await GetByIdAsync(countdown.Id) ?? throw new Exception("Failed to retrieve updated countdown.");
    }

    public async Task DeleteAsync(int id)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync("DELETE FROM countdowns WHERE id = @Id", new { Id = id });
    }
}
