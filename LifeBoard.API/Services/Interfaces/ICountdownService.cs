using LifeBoard.API.Models.DTOs;

namespace LifeBoard.API.Services.Interfaces;

public interface ICountdownService
{
    Task<IEnumerable<CountdownDto>> GetAllAsync();
    Task<CountdownDto> CreateAsync(CreateCountdownDto dto);
    Task<CountdownDto> UpdateAsync(int id, UpdateCountdownDto dto);
    Task DeleteAsync(int id);
}
