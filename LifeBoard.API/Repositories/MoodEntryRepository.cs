using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

public class MoodEntryRepository(DbConnectionFactory db) : IMoodEntryRepository
{
    private readonly DbConnectionFactory _db = db;

    public async Task<MoodEntryEntity?> GetByDateAsync(DateTime date)
    {
        using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<MoodEntryEntity>(
            "SELECT * FROM mood_entries WHERE entry_date = @Date",
            new { Date = date.ToString("yyyy-MM-dd") }
        );
    }

    public async Task<IEnumerable<MoodEntryEntity>> GetAllAsync()
    {
        using var conn = _db.CreateConnection();
        return await conn.QueryAsync<MoodEntryEntity>("SELECT * FROM mood_entries ORDER BY entry_date DESC");
    }

    public async Task<MoodEntryEntity> UpsertAsync(MoodEntryEntity entry)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            INSERT INTO mood_entries (entry_date, score, note)
            VALUES (@EntryDate, @Score, @Note)
            ON DUPLICATE KEY UPDATE score = @Score, note = @Note;
            SELECT * FROM mood_entries WHERE entry_date = @EntryDate;";
        return await conn.QuerySingleAsync<MoodEntryEntity>(sql, new { EntryDate = entry.EntryDate.ToString("yyyy-MM-dd"), Score = entry.Score, Note = entry.Note });
    }

    public async Task DeleteAsync(int id)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync("DELETE FROM mood_entries WHERE id = @Id", new { Id = id });
    }
}
