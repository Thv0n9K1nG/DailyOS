using LifeBoard.API.Models.Entities;

namespace LifeBoard.API.Repositories.Interfaces;

public interface IDailyNoteRepository
{
    Task<DailyNoteEntity?> GetByDateAsync(DateTime date);
    Task<IEnumerable<DailyNoteEntity>> GetAllAsync();
    Task<DailyNoteEntity> UpsertAsync(DailyNoteEntity note);
    Task DeleteAsync(int id);
}
