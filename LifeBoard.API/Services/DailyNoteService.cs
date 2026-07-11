using LifeBoard.API.Services.Interfaces;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Services;

// TODO: Implement — see docs/08-SDD.md and docs/06-SRS.md
public class DailyNoteService : IDailyNoteService
{
    private readonly IDailyNoteRepository _repository;
    private readonly ILogger<DailyNoteService> _logger;
    public DailyNoteService(IDailyNoteRepository repository, ILogger<DailyNoteService> logger)
    { _repository = repository; _logger = logger; }
}
