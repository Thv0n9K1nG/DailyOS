using LifeBoard.API.Models.DTOs;

namespace LifeBoard.API.Services.Interfaces;

public interface ISettingsService
{
    Task<SettingsDto> GetAsync();
    Task<SettingsDto> UpdateAsync(SettingsDto settings);
}
