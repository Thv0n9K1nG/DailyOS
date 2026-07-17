using LifeBoard.API.Models.Entities;

namespace LifeBoard.API.Repositories.Interfaces;

public interface ICountdownRepository
{
    Task<IEnumerable<CountdownEntity>> GetAllAsync();
    Task<CountdownEntity?> GetByIdAsync(int id);
    Task<CountdownEntity> CreateAsync(CountdownEntity countdown);
    Task<CountdownEntity> UpdateAsync(CountdownEntity countdown);
    Task DeleteAsync(int id);
}
