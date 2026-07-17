using LifeBoard.API.Models.Entities;

namespace LifeBoard.API.Repositories.Interfaces;

public interface IGoalRepository
{
    Task<IEnumerable<GoalEntity>> GetAllAsync(string? status = null);
    Task<GoalEntity?> GetByIdAsync(int id);
    Task<GoalEntity> CreateAsync(GoalEntity goal);
    Task<GoalEntity> UpdateAsync(GoalEntity goal);
    Task DeleteAsync(int id);
}
