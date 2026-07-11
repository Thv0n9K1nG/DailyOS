using LifeBoard.API.Services.Interfaces;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Services;

// TODO: Implement — see docs/08-SDD.md and docs/06-SRS.md
public class CountdownService : ICountdownService
{
    private readonly ICountdownRepository _repository;
    private readonly ILogger<CountdownService> _logger;
    public CountdownService(ICountdownRepository repository, ILogger<CountdownService> logger)
    { _repository = repository; _logger = logger; }
}
