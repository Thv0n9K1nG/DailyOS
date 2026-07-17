using LifeBoard.API.Models.DTOs;

namespace LifeBoard.API.Services.Interfaces;

public interface IMoodEntryService
{
    Task<MoodEntryDto?> GetByDateAsync(DateTime date);
    Task<IEnumerable<MoodEntryDto>> GetAllAsync();
    Task<MoodEntryDto> UpsertAsync(UpsertMoodEntryDto dto);
    Task DeleteAsync(int id);
}
