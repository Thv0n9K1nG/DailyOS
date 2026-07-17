using LifeBoard.API.Models.DTOs;

namespace LifeBoard.API.Services.Interfaces;

public interface IDailyNoteService
{
    Task<DailyNoteDto?> GetByDateAsync(DateTime date);
    Task<IEnumerable<DailyNoteDto>> GetAllAsync();
    Task<DailyNoteDto> UpsertAsync(UpsertDailyNoteDto dto);
    Task DeleteAsync(int id);
}
