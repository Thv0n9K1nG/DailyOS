using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/daily-notes")]
public class DailyNotesController(ILogger<DailyNotesController> logger, IDailyNoteService service) : ControllerBase
{
    // TODO: Implement endpoints
    // Reference: docs/09-API-Specification.md — section for /daily-notes
}
