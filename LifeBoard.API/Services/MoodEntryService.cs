using LifeBoard.API.Services.Interfaces;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Services;

// TODO: Implement — see docs/08-SDD.md and docs/06-SRS.md
public class MoodEntryService : IMoodEntryService
{
    private readonly IMoodEntryRepository _repository;
    private readonly ILogger<MoodEntryService> _logger;
    public MoodEntryService(IMoodEntryRepository repository, ILogger<MoodEntryService> logger)
    { _repository = repository; _logger = logger; }
}
