using LifeBoard.API.Services.Interfaces;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Services;

// TODO: Implement — see docs/08-SDD.md and docs/06-SRS.md
public class GoalService : IGoalService
{
    private readonly IGoalRepository _repository;
    private readonly ILogger<GoalService> _logger;
    public GoalService(IGoalRepository repository, ILogger<GoalService> logger)
    { _repository = repository; _logger = logger; }
}
