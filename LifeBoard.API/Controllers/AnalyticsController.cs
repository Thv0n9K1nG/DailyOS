using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/analytics")]
public class AnalyticsController(ILogger<AnalyticsController> logger, IAnalyticsService service) : ControllerBase
{
    private readonly IAnalyticsService _service = service;

    /// <summary>GET /analytics/weekly?weekStart=YYYY-MM-DD (defaults to last Monday)</summary>
    [HttpGet("weekly")]
    public async Task<IActionResult> GetWeekly([FromQuery] string? weekStart = null)
    {
        var start = weekStart is not null
            ? DateTime.Parse(weekStart)
            : GetLastMonday(DateTime.Today);
        return Ok(await _service.GetWeeklyAsync(start));
    }

    /// <summary>GET /analytics/monthly?year=2026&month=7</summary>
    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthly(
        [FromQuery] int? year = null,
        [FromQuery] int? month = null)
    {
        var y = year ?? DateTime.Today.Year;
        var m = month ?? DateTime.Today.Month;
        if (m < 1 || m > 12)
            return BadRequest(new { message = "Month must be between 1 and 12." });
        return Ok(await _service.GetMonthlyAsync(y, m));
    }

    /// <summary>GET /analytics/yearly?year=2026</summary>
    [HttpGet("yearly")]
    public async Task<IActionResult> GetYearly([FromQuery] int? year = null)
    {
        return Ok(await _service.GetYearlyAsync(year ?? DateTime.Today.Year));
    }

    /// <summary>GET /analytics/statistics?from=YYYY-MM-DD&to=YYYY-MM-DD (default last 30 days)</summary>
    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics(
        [FromQuery] string? from = null,
        [FromQuery] string? to = null)
    {
        var toDate = to is not null ? DateTime.Parse(to) : DateTime.Today;
        var fromDate = from is not null ? DateTime.Parse(from) : toDate.AddDays(-30);
        return Ok(await _service.GetStatisticsAsync(fromDate, toDate));
    }

    private static DateTime GetLastMonday(DateTime date)
    {
        int diff = ((int)date.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
        return date.AddDays(-diff).Date;
    }
}

