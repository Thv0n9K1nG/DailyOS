using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/analytics")]
public class AnalyticsController(ILogger<AnalyticsController> logger, IAnalyticsService service) : ControllerBase
{
    // TODO: Implement endpoints
    // Reference: docs/09-API-Specification.md — section for /analytics
}
