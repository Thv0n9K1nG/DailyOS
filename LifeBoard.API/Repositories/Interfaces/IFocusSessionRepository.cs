using LifeBoard.API.Models.Entities;

namespace LifeBoard.API.Repositories.Interfaces;

public interface IFocusSessionRepository
{
    Task<IEnumerable<FocusSessionEntity>> GetAllAsync(DateTime from, DateTime to);
    Task<FocusSessionEntity> CreateAsync(FocusSessionEntity session);
    Task DeleteAsync(int id);
}
