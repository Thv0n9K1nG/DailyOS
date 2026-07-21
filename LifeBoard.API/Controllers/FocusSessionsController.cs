using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/focus-sessions")]
public class FocusSessionsController(ILogger<FocusSessionsController> logger, IFocusSessionService service) : ControllerBase
{
    private readonly IFocusSessionService _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] DateTime from, [FromQuery] DateTime to, [FromQuery] string? type)
    {
        return Ok(await _service.GetAllAsync(from, to, type));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFocusSessionDto dto)
    {
        var session = await _service.CreateAsync(dto);
        return Created("", session);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateFocusSessionDto dto)
    {
        var session = await _service.UpdateAsync(id, dto);
        return Ok(session);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
