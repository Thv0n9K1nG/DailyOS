using LifeBoard.API.Models.DTOs;

namespace LifeBoard.API.Services.Interfaces;

public interface IHabitService
{
    Task<IEnumerable<HabitDto>> GetAllActiveAsync();
    Task<HabitDto> CreateAsync(CreateHabitDto dto);
    Task<HabitDto> UpdateAsync(int id, UpdateHabitDto dto);
    Task DeleteAsync(int id);
    Task DeactivateAsync(int id);
    Task UpsertCheckinAsync(int id, DateTime date, bool isCompleted);
}
