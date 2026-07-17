using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Services;

public class GoalService(IGoalRepository repository) : IGoalService
{
    private readonly IGoalRepository _repository = repository;

    private static GoalDto ToDto(GoalEntity e) => new GoalDto
    {
        Id = e.Id,
        Title = e.Title,
        Description = e.Description,
        CurrentValue = e.CurrentValue,
        TargetValue = e.TargetValue,
        Unit = e.Unit,
        ProgressPercent = e.TargetValue > 0 ? Math.Round((double)e.CurrentValue / (double)e.TargetValue * 100, 1) : 0,
        Deadline = e.Deadline,
        Status = e.Status,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt,
    };

    public async Task<IEnumerable<GoalDto>> GetAllAsync(string? status = null)
    {
        var items = await _repository.GetAllAsync(status);
        return items.Select(ToDto);
    }

    public async Task<GoalDto?> GetByIdAsync(int id)
    {
        var e = await _repository.GetByIdAsync(id);
        return e is null ? null : ToDto(e);
    }

    public async Task<GoalDto> CreateAsync(CreateGoalDto dto)
    {
        var entity = new GoalEntity
        {
            Title = dto.Title,
            Description = dto.Description,
            CurrentValue = dto.CurrentValue,
            TargetValue = dto.TargetValue,
            Unit = dto.Unit,
            Deadline = dto.Deadline,
            Status = dto.CurrentValue >= dto.TargetValue ? "completed" : "active",
        };
        var created = await _repository.CreateAsync(entity);
        return ToDto(created);
    }

    public async Task<GoalDto> UpdateAsync(int id, UpdateGoalDto dto)
    {
        var existing = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Goal not found.");
        existing.Title = dto.Title;
        existing.Description = dto.Description;
        existing.CurrentValue = dto.CurrentValue;
        existing.TargetValue = dto.TargetValue;
        existing.Unit = dto.Unit;
        existing.Deadline = dto.Deadline;
        existing.Status = dto.Status;
        var updated = await _repository.UpdateAsync(existing);
        return ToDto(updated);
    }

    public async Task<GoalDto> UpdateProgressAsync(int id, UpdateGoalProgressDto dto)
    {
        var existing = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Goal not found.");
        existing.CurrentValue = dto.CurrentValue;
        if (existing.CurrentValue >= existing.TargetValue)
            existing.Status = "completed";
        var updated = await _repository.UpdateAsync(existing);
        return ToDto(updated);
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }
}

