using LifeBoard.API.Models.DTOs;

namespace LifeBoard.API.Services.Interfaces;

public interface ITagService
{
    Task<IEnumerable<TagDto>> GetAllAsync();
    Task<TagDto> CreateAsync(CreateTagDto dto);
    Task<TagDto> UpdateAsync(int id, UpdateTagDto dto);
    Task DeleteAsync(int id);
}
