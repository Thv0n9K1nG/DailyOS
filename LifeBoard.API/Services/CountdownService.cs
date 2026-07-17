using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Services;

public class CountdownService(ICountdownRepository repository) : ICountdownService
{
    private readonly ICountdownRepository _repository = repository;

    private static CountdownDto MapToDto(CountdownEntity e) => new()
    {
        Id = e.Id,
        Title = e.Title,
        TargetDate = e.TargetDate,
        DaysRemaining = (e.TargetDate.Date - DateTime.Today).Days,
        Icon = e.Icon,
        Color = e.Color,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };

    public async Task<IEnumerable<CountdownDto>> GetAllAsync()
    {
        var items = await _repository.GetAllAsync();
        return items.Select(MapToDto);
    }

    public async Task<CountdownDto> CreateAsync(CreateCountdownDto dto)
    {
        var entity = new CountdownEntity { Title = dto.Title, TargetDate = dto.TargetDate.Date, Icon = dto.Icon, Color = dto.Color };
        var created = await _repository.CreateAsync(entity);
        return MapToDto(created);
    }

    public async Task<CountdownDto> UpdateAsync(int id, UpdateCountdownDto dto)
    {
        var existing = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Countdown not found");
        existing.Title = dto.Title;
        existing.TargetDate = dto.TargetDate.Date;
        existing.Icon = dto.Icon;
        existing.Color = dto.Color;
        var updated = await _repository.UpdateAsync(existing);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }
}
