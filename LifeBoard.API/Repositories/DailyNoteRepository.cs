using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

public class DailyNoteRepository(DbConnectionFactory db) : IDailyNoteRepository
{
    private readonly DbConnectionFactory _db = db;

    public async Task<DailyNoteEntity?> GetByDateAsync(DateTime date)
    {
        using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<DailyNoteEntity>(
            "SELECT * FROM daily_notes WHERE note_date = @Date",
            new { Date = date.ToString("yyyy-MM-dd") }
        );
    }

    public async Task<IEnumerable<DailyNoteEntity>> GetAllAsync()
    {
        using var conn = _db.CreateConnection();
        return await conn.QueryAsync<DailyNoteEntity>("SELECT * FROM daily_notes ORDER BY note_date DESC");
    }

    public async Task<DailyNoteEntity> UpsertAsync(DailyNoteEntity note)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            INSERT INTO daily_notes (note_date, content)
            VALUES (@NoteDate, @Content)
            ON DUPLICATE KEY UPDATE content = @Content;
            SELECT * FROM daily_notes WHERE note_date = @NoteDate;";
        return await conn.QuerySingleAsync<DailyNoteEntity>(sql, new { NoteDate = note.NoteDate.ToString("yyyy-MM-dd"), Content = note.Content });
    }

    public async Task DeleteAsync(int id)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync("DELETE FROM daily_notes WHERE id = @Id", new { Id = id });
    }
}
