using LifeBoard.API.Services.Interfaces;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Services;

// TODO: Implement — see docs/08-SDD.md and docs/06-SRS.md
public class FocusSessionService : IFocusSessionService
{
    private readonly IFocusSessionRepository _repository;
    private readonly ILogger<FocusSessionService> _logger;
    public FocusSessionService(IFocusSessionRepository repository, ILogger<FocusSessionService> logger)
    { _repository = repository; _logger = logger; }
}
