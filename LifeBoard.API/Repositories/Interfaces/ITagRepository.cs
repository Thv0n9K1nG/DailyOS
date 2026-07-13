using LifeBoard.API.Models.Entities;

namespace LifeBoard.API.Repositories.Interfaces;

public interface ITagRepository
{
    Task<IEnumerable<TagEntity>> GetAllAsync();
    Task<TagEntity?> GetByIdAsync(int id);
    Task<TagEntity> CreateAsync(TagEntity tag);
    Task<TagEntity> UpdateAsync(TagEntity tag);
    Task DeleteAsync(int id);
}
