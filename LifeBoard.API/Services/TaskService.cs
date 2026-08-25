using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Services;

public class TaskService(ITaskRepository repository, ILogger<TaskService> logger) : ITaskService
{
    private readonly ITaskRepository _repository = repository;

    public async Task<object> GetTasksAsync(string? status, string? priority, DateTime? plannedDate, string? search, int page = 1, int pageSize = 50)
    {
        var tasks = await _repository.GetTasksAsync(status, priority, plannedDate, search);
        // Simple pagination
        var paginated = tasks.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return new { data = paginated, total = tasks.Count() };
    }

    public async Task<TaskDto?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<TaskDto> CreateAsync(CreateTaskDto dto)
    {
        var entity = new TaskEntity
        {
            Title = dto.Title, Description = dto.Description, Priority = dto.Priority,
            Deadline = dto.Deadline, IsRecurring = dto.IsRecurring, RecurrenceType = dto.RecurrenceType,
            RecurrenceEndDate = dto.RecurrenceEndDate, PlannedDate = dto.PlannedDate
        };
        return await _repository.CreateAsync(entity, dto.TagIds);
    }

    public async Task<TaskDto> UpdateAsync(int id, UpdateTaskDto dto)
    {
        var existing = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Task not found");
        var entity = new TaskEntity
        {
            Id = id, Title = dto.Title, Description = dto.Description, Priority = dto.Priority,
            Deadline = dto.Deadline, IsRecurring = dto.IsRecurring, RecurrenceType = dto.RecurrenceType,
            RecurrenceEndDate = dto.RecurrenceEndDate, PlannedDate = dto.PlannedDate
        };
        return await _repository.UpdateAsync(entity, dto.TagIds);
    }

    public async Task<TaskDto> CompleteAsync(int id)
    {
        var existing = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Task not found");
        var now = DateTime.UtcNow;

        var finalStatus = DetermineCompletionStatus(existing, now);

        await _repository.UpdateStatusAsync(id, finalStatus, now);
        return await _repository.GetByIdAsync(id) ?? throw new Exception("Task missing");
    }

    /// <summary>
    /// Determines whether a task completed at <paramref name="completedAt"/> should be
    /// "done" (on time) or "done_late" (past deadline or past planned date).
    ///
    /// Rules:
    ///   1. If the task has a Deadline:
    ///        - completedAt ≤ Deadline  → "done"
    ///        - completedAt > Deadline  → "done_late"
    ///   2. If no Deadline but PlannedDate exists:
    ///        - completedAt date ≤ PlannedDate date → "done"
    ///        - completedAt date >  PlannedDate date → "done_late"
    ///   3. No Deadline, no PlannedDate → always "done"
    /// </summary>
    private static string DetermineCompletionStatus(TaskDto task, DateTime completedAt)
    {
        // Case 1: Has explicit deadline
        if (task.Deadline.HasValue)
        {
            return completedAt > task.Deadline.Value ? "done_late" : "done";
        }

        // Case 2: No deadline but has a planned date — compare calendar dates
        if (task.PlannedDate.HasValue)
        {
            // PlannedDate is stored as DATE (no time), interpret as end-of-day UTC boundary.
            // A task is "late" when the completion date (UTC date) is strictly after the planned date.
            var plannedDateOnly = DateOnly.FromDateTime(task.PlannedDate.Value);
            var completedDateOnly = DateOnly.FromDateTime(completedAt);
            return completedDateOnly > plannedDateOnly ? "done_late" : "done";
        }

        // Case 3: No deadline, no planned date
        return "done";
    }

    public async Task<TaskDto> UncompleteAsync(int id)
    {
        var existing = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Task not found");
        await _repository.UpdateStatusAsync(id, "pending", null);
        return await _repository.GetByIdAsync(id) ?? throw new Exception("Task missing");
    }

    public async Task<TaskDto> ArchiveAsync(int id)
    {
        var existing = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Task not found");
        await _repository.UpdateStatusAsync(id, "archived", existing.CompletedAt);
        return await _repository.GetByIdAsync(id) ?? throw new Exception("Task missing");
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }
}
