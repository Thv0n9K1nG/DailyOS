using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Services;

public class SettingsService(ISettingsRepository repository) : ISettingsService
{
    private readonly ISettingsRepository _repository = repository;

    public async Task<SettingsDto> GetAsync()
    {
        var e = await _repository.GetAsync();
        return new SettingsDto
        {
            Theme = e.Theme,
            PomodoroFocusMinutes = e.PomodoroFocusMinutes,
            PomodoroBreakMinutes = e.PomodoroBreakMinutes,
            PomodoroRounds = e.PomodoroRounds,
            HabitGracePeriodDays = e.HabitGracePeriodDays,
            Language = e.Language,
            Timezone = e.Timezone,
        };
    }

    public async Task<SettingsDto> UpdateAsync(SettingsDto dto)
    {
        var e = new SettingsEntity
        {
            Theme = dto.Theme,
            PomodoroFocusMinutes = dto.PomodoroFocusMinutes,
            PomodoroBreakMinutes = dto.PomodoroBreakMinutes,
            PomodoroRounds = dto.PomodoroRounds,
            HabitGracePeriodDays = dto.HabitGracePeriodDays,
            Language = dto.Language,
            Timezone = dto.Timezone,
        };
        e = await _repository.UpdateAsync(e);
        return new SettingsDto
        {
            Theme = e.Theme,
            PomodoroFocusMinutes = e.PomodoroFocusMinutes,
            PomodoroBreakMinutes = e.PomodoroBreakMinutes,
            PomodoroRounds = e.PomodoroRounds,
            HabitGracePeriodDays = e.HabitGracePeriodDays,
            Language = e.Language,
            Timezone = e.Timezone,
        };
    }
}

