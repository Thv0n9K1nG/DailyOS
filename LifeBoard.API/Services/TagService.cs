using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Services;

public class TagService(ITagRepository repository, ILogger<TagService> logger) : ITagService
{
    private readonly ITagRepository _repository = repository;
    private readonly ILogger<TagService> _logger = logger;

    public async Task<IEnumerable<TagDto>> GetAllAsync()
    {
        var tags = await _repository.GetAllAsync();
        return tags.Select(t => new TagDto { Id = t.Id, Name = t.Name, Color = t.Color });
    }

    public async Task<TagDto> CreateAsync(CreateTagDto dto)
    {
        var entity = new TagEntity { Name = dto.Name, Color = dto.Color };
        var created = await _repository.CreateAsync(entity);
        return new TagDto { Id = created.Id, Name = created.Name, Color = created.Color };
    }

    public async Task<TagDto> UpdateAsync(int id, UpdateTagDto dto)
    {
        var existing = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Tag not found");
        existing.Name = dto.Name;
        existing.Color = dto.Color;
        var updated = await _repository.UpdateAsync(existing);
        return new TagDto { Id = updated.Id, Name = updated.Name, Color = updated.Color };
    }

    public async Task DeleteAsync(int id)
    {
        var existing = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Tag not found");
        await _repository.DeleteAsync(id);
    }
}
