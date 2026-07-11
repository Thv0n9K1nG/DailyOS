using LifeBoard.API.Services.Interfaces;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Services;

// TODO: Implement — see docs/08-SDD.md and docs/06-SRS.md
public class SearchService : ISearchService
{
    private readonly ITaskRepository _repository;
    private readonly ILogger<SearchService> _logger;
    public SearchService(ITaskRepository repository, ILogger<SearchService> logger)
    { _repository = repository; _logger = logger; }
}
