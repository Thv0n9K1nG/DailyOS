using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/countdowns")]
public class CountdownsController(ILogger<CountdownsController> logger, ICountdownService service) : ControllerBase
{
    // TODO: Implement endpoints
    // Reference: docs/09-API-Specification.md — section for /countdowns
}
