using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/focus-sessions")]
public class FocusSessionsController(ILogger<FocusSessionsController> logger, IFocusSessionService service) : ControllerBase
{
    // TODO: Implement endpoints
    // Reference: docs/09-API-Specification.md — section for /focus-sessions
}
