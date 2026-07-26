using System.Data;
using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

public class TaskRepository(DbConnectionFactory db) : ITaskRepository
{
    private readonly DbConnectionFactory _db = db;

    // ── Private helpers ────────────────────────────────────────────────────────
    private static TaskDto MapEntityToDto(TaskEntity t, List<TagDto>? tags = null) => new()
    {
        Id             = t.Id,
        Title          = t.Title,
        Description    = t.Description,
        Priority       = t.Priority,
        Status         = t.Status,
        Deadline       = t.Deadline,
        IsRecurring    = t.IsRecurring,
        RecurrenceType = t.RecurrenceType,
        RecurrenceEndDate = t.RecurrenceEndDate,
        PlannedDate    = t.PlannedDate,
        CreatedAt      = t.CreatedAt,
        CompletedAt    = t.CompletedAt,
        UpdatedAt      = t.UpdatedAt,
        Tags           = tags ?? []
    };

    private async Task<Dictionary<int, List<TagDto>>> GetTagsForTasksAsync(
        IDbConnection conn, IEnumerable<int> taskIds)
    {
        var ids = taskIds.ToList();
        if (!ids.Any()) return [];

        var rows = await conn.QueryAsync<(int TaskId, int TagId, string TagName, string TagColor)>(
            @"SELECT tt.task_id AS TaskId, tg.id AS TagId, tg.name AS TagName, tg.color AS TagColor
              FROM task_tags tt
              JOIN tags tg ON tg.id = tt.tag_id
              WHERE tt.task_id IN @ids",
            new { ids });

        return rows.GroupBy(r => r.TaskId).ToDictionary(
            g => g.Key,
            g => g.Select(r => new TagDto { Id = r.TagId, Name = r.TagName, Color = r.TagColor }).ToList());
    }

    // ── Public CRUD ────────────────────────────────────────────────────────────
    public async Task<IEnumerable<TaskDto>> GetTasksAsync(
        string? status, string? priority, DateTime? plannedDate, string? search)
    {
        using var conn = _db.CreateConnection();

        var sql    = new System.Text.StringBuilder("SELECT * FROM tasks WHERE 1=1");
        var param  = new DynamicParameters();

        if (!string.IsNullOrEmpty(status))
        {
            sql.Append(" AND status = @Status");
            param.Add("Status", status);
        }
        if (!string.IsNullOrEmpty(priority))
        {
            sql.Append(" AND priority = @Priority");
            param.Add("Priority", priority);
        }
        if (plannedDate.HasValue)
        {
            sql.Append(" AND planned_date = @PlannedDate");
            param.Add("PlannedDate", plannedDate.Value.ToString("yyyy-MM-dd"));
        }
        if (!string.IsNullOrEmpty(search))
        {
            sql.Append(" AND (title LIKE @Search OR description LIKE @Search)");
            param.Add("Search", $"%{search}%");
        }

        sql.Append(" ORDER BY FIELD(priority,'high','medium','low'), created_at DESC");

        var tasks = (await conn.QueryAsync<TaskEntity>(sql.ToString(), param)).ToList();

        var tagsMap = await GetTagsForTasksAsync(conn, tasks.Select(t => t.Id));
        return tasks.Select(t => MapEntityToDto(t, tagsMap.GetValueOrDefault(t.Id, [])));
    }

    public async Task<TaskDto?> GetByIdAsync(int id)
    {
        using var conn = _db.CreateConnection();
        var task = await conn.QuerySingleOrDefaultAsync<TaskEntity>(
            "SELECT * FROM tasks WHERE id = @Id", new { Id = id });
        if (task is null) return null;

        var tagsMap = await GetTagsForTasksAsync(conn, [task.Id]);
        return MapEntityToDto(task, tagsMap.GetValueOrDefault(task.Id, []));
    }

    public async Task<TaskDto> CreateAsync(TaskEntity task, List<int> tagIds)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            INSERT INTO tasks
              (title, description, priority, deadline, is_recurring,
               recurrence_type, recurrence_end_date, planned_date)
            VALUES
              (@Title, @Description, @Priority, @Deadline, @IsRecurring,
               @RecurrenceType, @RecurrenceEndDate, @PlannedDate);
            SELECT LAST_INSERT_ID();";

        var newId = await conn.ExecuteScalarAsync<int>(sql, task);

        if (tagIds?.Count > 0)
            await conn.ExecuteAsync(
                "INSERT INTO task_tags (task_id, tag_id) VALUES (@TaskId, @TagId)",
                tagIds.Select(t => new { TaskId = newId, TagId = t }));

        return await GetByIdAsync(newId) ?? throw new Exception("Failed to retrieve created task.");
    }

    public async Task<TaskDto> UpdateAsync(TaskEntity task, List<int> tagIds)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync(@"
            UPDATE tasks SET
              title=@Title, description=@Description, priority=@Priority,
              deadline=@Deadline, is_recurring=@IsRecurring,
              recurrence_type=@RecurrenceType, recurrence_end_date=@RecurrenceEndDate,
              planned_date=@PlannedDate
            WHERE id=@Id", task);

        await conn.ExecuteAsync("DELETE FROM task_tags WHERE task_id = @Id", new { task.Id });
        if (tagIds?.Count > 0)
            await conn.ExecuteAsync(
                "INSERT INTO task_tags (task_id, tag_id) VALUES (@TaskId, @TagId)",
                tagIds.Select(t => new { TaskId = task.Id, TagId = t }));

        return await GetByIdAsync(task.Id) ?? throw new Exception("Failed to retrieve updated task.");
    }

    public async Task UpdateStatusAsync(int id, string status, DateTime? completedAt)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync(
            "UPDATE tasks SET status=@Status, completed_at=@CompletedAt WHERE id=@Id",
            new { Id = id, Status = status, CompletedAt = completedAt });
    }

    public async Task DeleteAsync(int id)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync("DELETE FROM tasks WHERE id=@Id", new { Id = id });
    }
}
