using LifeBoard.API.Models.Entities;

namespace LifeBoard.API.Repositories.Interfaces;

public interface IMoodEntryRepository
{
    Task<MoodEntryEntity?> GetByDateAsync(DateTime date);
    Task<IEnumerable<MoodEntryEntity>> GetAllAsync();
    Task<MoodEntryEntity> UpsertAsync(MoodEntryEntity entry);
    Task DeleteAsync(int id);
}
