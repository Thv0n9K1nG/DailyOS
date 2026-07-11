using LifeBoard.API.Services.Interfaces;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Services;

// TODO: Implement — see docs/08-SDD.md and docs/06-SRS.md
public class SettingsService : ISettingsService
{
    private readonly ISettingsRepository _repository;
    private readonly ILogger<SettingsService> _logger;
    public SettingsService(ISettingsRepository repository, ILogger<SettingsService> logger)
    { _repository = repository; _logger = logger; }
}
