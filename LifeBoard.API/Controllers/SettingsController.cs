using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/settings")]
public class SettingsController(ILogger<SettingsController> logger, ISettingsService service) : ControllerBase
{
    private readonly ISettingsService _service = service;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return Ok(await _service.GetAsync());
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] SettingsDto dto)
    {
        return Ok(await _service.UpdateAsync(dto));
    }
}
