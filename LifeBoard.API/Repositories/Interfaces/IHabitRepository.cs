using LifeBoard.API.Models.Entities;

namespace LifeBoard.API.Repositories.Interfaces;

public interface IHabitRepository
{
    Task<IEnumerable<HabitEntity>> GetAllActiveAsync();
    Task<HabitEntity?> GetByIdAsync(int id);
    Task<HabitEntity> CreateAsync(HabitEntity habit);
    Task<HabitEntity> UpdateAsync(HabitEntity habit);
    Task DeleteAsync(int id);
    Task DeactivateAsync(int id);
    Task<IEnumerable<HabitCheckInEntity>> GetCheckinsAsync(int habitId, DateTime from, DateTime to);
    Task UpsertCheckinAsync(int habitId, DateTime date, bool isCompleted);
}
