using LifeBoard.API.Models.Entities;

namespace LifeBoard.API.Repositories.Interfaces;

public interface ISettingsRepository
{
    Task<SettingsEntity> GetAsync();
    Task<SettingsEntity> UpdateAsync(SettingsEntity settings);
}
