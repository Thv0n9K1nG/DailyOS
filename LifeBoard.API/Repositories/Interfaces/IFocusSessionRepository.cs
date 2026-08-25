using LifeBoard.API.Models.Entities;

namespace LifeBoard.API.Repositories.Interfaces;

public interface IFocusSessionRepository
{
    Task<IEnumerable<FocusSessionEntity>> GetAllAsync(DateTime from, DateTime to);
    Task<FocusSessionEntity?> GetByIdAsync(int id);
    Task<FocusSessionEntity?> GetActiveStopwatchAsync();
    Task<FocusSessionEntity> CreateAsync(FocusSessionEntity session);
    Task<FocusSessionEntity> UpdateAsync(FocusSessionEntity session);
    Task DeleteAsync(int id);
}
