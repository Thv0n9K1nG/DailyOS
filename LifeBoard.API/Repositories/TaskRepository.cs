using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

public class TaskRepository(DbConnectionFactory db) : ITaskRepository
{
    private readonly DbConnectionFactory _db = db;

    public async Task<IEnumerable<TaskDto>> GetTasksAsync(string? status, string? priority, DateTime? plannedDate, string? search)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            SELECT t.*, tg.* 
            FROM tasks t
            LEFT JOIN task_tags tt ON t.id = tt.task_id
            LEFT JOIN tags tg ON tt.tag_id = tg.id
            WHERE 1=1";
            
        var parameters = new DynamicParameters();
        if (!string.IsNullOrEmpty(status)) { sql += " AND t.status = @Status"; parameters.Add("Status", status); }
        if (!string.IsNullOrEmpty(priority)) { sql += " AND t.priority = @Priority"; parameters.Add("Priority", priority); }
        if (plannedDate.HasValue) { sql += " AND t.planned_date = @PlannedDate"; parameters.Add("PlannedDate", plannedDate.Value.ToString("yyyy-MM-dd")); }
        if (!string.IsNullOrEmpty(search)) { sql += " AND (t.title LIKE @Search OR t.description LIKE @Search)"; parameters.Add("Search", $"%{search}%"); }
        
        sql += " ORDER BY t.created_at DESC";

        var taskDictionary = new Dictionary<int, TaskDto>();

        await conn.QueryAsync<TaskEntity, TagEntity, TaskDto>(
            sql,
            (task, tag) =>
            {
                if (!taskDictionary.TryGetValue(task.Id, out var taskDto))
                {
                    taskDto = new TaskDto
                    {
                        Id = task.Id, Title = task.Title, Description = task.Description,
                        Priority = task.Priority, Status = task.Status, Deadline = task.Deadline,
                        IsRecurring = task.IsRecurring, RecurrenceType = task.RecurrenceType,
                        RecurrenceEndDate = task.RecurrenceEndDate, PlannedDate = task.PlannedDate,
                        CreatedAt = task.CreatedAt, CompletedAt = task.CompletedAt, UpdatedAt = task.UpdatedAt,
                        Tags = new List<TagDto>()
                    };
                    taskDictionary.Add(taskDto.Id, taskDto);
                }
                if (tag != null)
                {
                    taskDto.Tags.Add(new TagDto { Id = tag.Id, Name = tag.Name, Color = tag.Color });
                }
                return taskDto;
            },
            parameters,
            splitOn: "id"
        );

        return taskDictionary.Values;
    }

    public async Task<TaskDto?> GetByIdAsync(int id)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            SELECT t.*, tg.* 
            FROM tasks t
            LEFT JOIN task_tags tt ON t.id = tt.task_id
            LEFT JOIN tags tg ON tt.tag_id = tg.id
            WHERE t.id = @Id";

        TaskDto? taskDto = null;
        await conn.QueryAsync<TaskEntity, TagEntity, TaskDto>(
            sql,
            (task, tag) =>
            {
                if (taskDto == null)
                {
                    taskDto = new TaskDto
                    {
                        Id = task.Id, Title = task.Title, Description = task.Description,
                        Priority = task.Priority, Status = task.Status, Deadline = task.Deadline,
                        IsRecurring = task.IsRecurring, RecurrenceType = task.RecurrenceType,
                        RecurrenceEndDate = task.RecurrenceEndDate, PlannedDate = task.PlannedDate,
                        CreatedAt = task.CreatedAt, CompletedAt = task.CompletedAt, UpdatedAt = task.UpdatedAt,
                        Tags = new List<TagDto>()
                    };
                }
                if (tag != null)
                {
                    taskDto.Tags.Add(new TagDto { Id = tag.Id, Name = tag.Name, Color = tag.Color });
                }
                return taskDto;
            },
            new { Id = id },
            splitOn: "id"
        );
        return taskDto;
    }

    public async Task<TaskDto> CreateAsync(TaskEntity task, List<int> tagIds)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            INSERT INTO tasks (title, description, priority, deadline, is_recurring, recurrence_type, recurrence_end_date, planned_date)
            VALUES (@Title, @Description, @Priority, @Deadline, @IsRecurring, @RecurrenceType, @RecurrenceEndDate, @PlannedDate);
            SELECT LAST_INSERT_ID();";
        
        var id = await conn.ExecuteScalarAsync<int>(sql, task);
        
        if (tagIds != null && tagIds.Any())
        {
            var tagSql = "INSERT INTO task_tags (task_id, tag_id) VALUES (@TaskId, @TagId)";
            var tagParams = tagIds.Select(t => new { TaskId = id, TagId = t });
            await conn.ExecuteAsync(tagSql, tagParams);
        }

        return await GetByIdAsync(id) ?? throw new Exception("Failed to retrieve created task.");
    }

    public async Task<TaskDto> UpdateAsync(TaskEntity task, List<int> tagIds)
    {
        using var conn = _db.CreateConnection();
        var sql = @"
            UPDATE tasks SET 
                title = @Title, description = @Description, priority = @Priority, 
                deadline = @Deadline, is_recurring = @IsRecurring, recurrence_type = @RecurrenceType, 
                recurrence_end_date = @RecurrenceEndDate, planned_date = @PlannedDate
            WHERE id = @Id";
        
        await conn.ExecuteAsync(sql, task);
        
        await conn.ExecuteAsync("DELETE FROM task_tags WHERE task_id = @Id", new { Id = task.Id });
        
        if (tagIds != null && tagIds.Any())
        {
            var tagSql = "INSERT INTO task_tags (task_id, tag_id) VALUES (@TaskId, @TagId)";
            var tagParams = tagIds.Select(t => new { TaskId = task.Id, TagId = t });
            await conn.ExecuteAsync(tagSql, tagParams);
        }

        return await GetByIdAsync(task.Id) ?? throw new Exception("Failed to retrieve updated task.");
    }

    public async Task UpdateStatusAsync(int id, string status, DateTime? completedAt)
    {
        using var conn = _db.CreateConnection();
        var sql = "UPDATE tasks SET status = @Status, completed_at = @CompletedAt WHERE id = @Id";
        await conn.ExecuteAsync(sql, new { Id = id, Status = status, CompletedAt = completedAt });
    }

    public async Task DeleteAsync(int id)
    {
        using var conn = _db.CreateConnection();
        await conn.ExecuteAsync("DELETE FROM tasks WHERE id = @Id", new { Id = id });
    }
}
