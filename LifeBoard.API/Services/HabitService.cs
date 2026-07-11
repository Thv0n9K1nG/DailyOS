using LifeBoard.API.Services.Interfaces;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Services;

// TODO: Implement — see docs/08-SDD.md and docs/06-SRS.md
public class HabitService : IHabitService
{
    private readonly IHabitRepository _repository;
    private readonly ILogger<HabitService> _logger;
    public HabitService(IHabitRepository repository, ILogger<HabitService> logger)
    { _repository = repository; _logger = logger; }
}
