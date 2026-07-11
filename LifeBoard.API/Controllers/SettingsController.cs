using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/settings")]
public class SettingsController(ILogger<SettingsController> logger, ISettingsService service) : ControllerBase
{
    // TODO: Implement endpoints
    // Reference: docs/09-API-Specification.md — section for /settings
}
