using LifeBoard.API.Services.Interfaces;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Services;

// TODO: Implement — see docs/08-SDD.md and docs/06-SRS.md
public class AnalyticsService : IAnalyticsService
{
    private readonly ISettingsRepository _repository;
    private readonly ILogger<AnalyticsService> _logger;
    public AnalyticsService(ISettingsRepository repository, ILogger<AnalyticsService> logger)
    { _repository = repository; _logger = logger; }
}
