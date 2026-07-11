using LifeBoard.API.Services.Interfaces;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Services;

// TODO: Implement — see docs/08-SDD.md and docs/06-SRS.md
public class TagService : ITagService
{
    private readonly ITagRepository _repository;
    private readonly ILogger<TagService> _logger;
    public TagService(ITagRepository repository, ILogger<TagService> logger)
    { _repository = repository; _logger = logger; }
}
