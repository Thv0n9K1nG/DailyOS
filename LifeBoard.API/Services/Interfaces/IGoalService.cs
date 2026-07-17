using LifeBoard.API.Models.DTOs;

namespace LifeBoard.API.Services.Interfaces;

public interface IGoalService
{
    Task<IEnumerable<GoalDto>> GetAllAsync(string? status = null);
    Task<GoalDto?> GetByIdAsync(int id);
    Task<GoalDto> CreateAsync(CreateGoalDto dto);
    Task<GoalDto> UpdateAsync(int id, UpdateGoalDto dto);
    Task<GoalDto> UpdateProgressAsync(int id, UpdateGoalProgressDto dto);
    Task DeleteAsync(int id);
}

