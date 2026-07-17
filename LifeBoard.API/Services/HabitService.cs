using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Services;

public class HabitService(IHabitRepository repository, ILogger<HabitService> logger) : IHabitService
{
    private readonly IHabitRepository _repository = repository;

    public async Task<IEnumerable<HabitDto>> GetAllActiveAsync()
    {
        var habits = await _repository.GetAllActiveAsync();
        var dtos = new List<HabitDto>();
        var today = DateTime.UtcNow.Date;

        foreach (var habit in habits)
        {
            var checkins = await _repository.GetCheckinsAsync(habit.Id, today.AddDays(-60), today); // Look back 60 days for streak
            var streak = CalculateStreak(checkins.ToList(), today);
            var checkedInToday = checkins.Any(c => c.CheckinDate.Date == today && c.IsCompleted);

            dtos.Add(new HabitDto
            {
                Id = habit.Id, Name = habit.Name, Description = habit.Description,
                Frequency = habit.Frequency, Icon = habit.Icon, Color = habit.Color,
                IsActive = habit.IsActive, CreatedAt = habit.CreatedAt,
                Streak = streak, CheckedInToday = checkedInToday
            });
        }
        return dtos;
    }

    private int CalculateStreak(List<HabitCheckInEntity> checkins, DateTime today)
    {
        if (!checkins.Any()) return 0;
        
        var streak = 0;
        var date = checkins.Any(c => c.CheckinDate.Date == today && c.IsCompleted) ? today : today.AddDays(-1);

        while (true)
        {
            if (checkins.Any(c => c.CheckinDate.Date == date && c.IsCompleted))
            {
                streak++;
                date = date.AddDays(-1);
            }
            else
            {
                break;
            }
        }
        return streak;
    }

    public async Task<HabitDto> CreateAsync(CreateHabitDto dto)
    {
        var entity = new HabitEntity
        {
            Name = dto.Name, Description = dto.Description, Frequency = dto.Frequency,
            Icon = dto.Icon, Color = dto.Color
        };
        var created = await _repository.CreateAsync(entity);
        return new HabitDto
        {
            Id = created.Id, Name = created.Name, Description = created.Description,
            Frequency = created.Frequency, Icon = created.Icon, Color = created.Color,
            IsActive = created.IsActive, CreatedAt = created.CreatedAt, Streak = 0, CheckedInToday = false
        };
    }

    public async Task<HabitDto> UpdateAsync(int id, UpdateHabitDto dto)
    {
        var existing = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Habit not found");
        existing.Name = dto.Name; existing.Description = dto.Description;
        existing.Frequency = dto.Frequency; existing.Icon = dto.Icon; existing.Color = dto.Color;
        
        var updated = await _repository.UpdateAsync(existing);
        return new HabitDto
        {
            Id = updated.Id, Name = updated.Name, Description = updated.Description,
            Frequency = updated.Frequency, Icon = updated.Icon, Color = updated.Color,
            IsActive = updated.IsActive, CreatedAt = updated.CreatedAt
        };
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }

    public async Task DeactivateAsync(int id)
    {
        await _repository.DeactivateAsync(id);
    }

    public async Task UpsertCheckinAsync(int id, DateTime date, bool isCompleted)
    {
        await _repository.UpsertCheckinAsync(id, date, isCompleted);
    }
}
