using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;

namespace LifeBoard.API.Repositories.Interfaces;

public interface ITaskRepository
{
    Task<IEnumerable<TaskDto>> GetTasksAsync(string? status, string? priority, DateTime? plannedDate, string? search);
    Task<TaskDto?> GetByIdAsync(int id);
    Task<TaskDto> CreateAsync(TaskEntity task, List<int> tagIds);
    Task<TaskDto> UpdateAsync(TaskEntity task, List<int> tagIds);
    Task UpdateStatusAsync(int id, string status, DateTime? completedAt);
    Task DeleteAsync(int id);
}
