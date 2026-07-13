using LifeBoard.API.Models.DTOs;

namespace LifeBoard.API.Services.Interfaces;

public interface ITaskService
{
    Task<object> GetTasksAsync(string? status, string? priority, DateTime? plannedDate, string? search, int page = 1, int pageSize = 50);
    Task<TaskDto?> GetByIdAsync(int id);
    Task<TaskDto> CreateAsync(CreateTaskDto dto);
    Task<TaskDto> UpdateAsync(int id, UpdateTaskDto dto);
    Task<TaskDto> CompleteAsync(int id);
    Task<TaskDto> UncompleteAsync(int id);
    Task<TaskDto> ArchiveAsync(int id);
    Task DeleteAsync(int id);
}
