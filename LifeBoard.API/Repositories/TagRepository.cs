using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

public class TagRepository(DbConnectionFactory db) : ITagRepository
{
    private readonly DbConnectionFactory _db = db;

    public async Task<IEnumerable<TagEntity>> GetAllAsync()
    {
        using var conn = _db.CreateConnection();
        return await conn.QueryAsync<TagEntity>("SELECT * FROM tags");
    }

    public async Task<TagEntity?> GetByIdAsync(int id)
    {
        using var conn = _db.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<TagEntity>("SELECT * FROM tags WHERE id = @Id", new { Id = id });
    }

    public async Task<TagEntity> CreateAsync(TagEntity tag)
    {
        using var conn = _db.CreateConnection();
        var sql = "INSERT INTO tags (name, color) VALUES (@Name, @Color); SELECT LAST_INSERT_ID();";
        var id = await conn.ExecuteScalarAsync<int>(sql, tag);
        tag.Id = id;
        return tag;
    }

    public async Task<TagEntity> UpdateAsync(TagEntity tag)
    {
        using var conn = _db.CreateConnection();
        var sql = "UPDATE tags SET name = @Name, color = @Color WHERE id = @Id";
        await conn.ExecuteAsync(sql, tag);
        return tag;
    }

    public async Task DeleteAsync(int id)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync("DELETE FROM tags WHERE id = @Id", new { Id = id });
    }
}
