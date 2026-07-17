using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/goals")]
public class GoalsController(ILogger<GoalsController> logger, IGoalService service) : ControllerBase
{
    private readonly IGoalService _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status = null)
    {
        return Ok(await _service.GetAllAsync(status));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var goal = await _service.GetByIdAsync(id);
        if (goal == null) return NotFound(new { message = "Goal not found." });
        return Ok(goal);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGoalDto dto)
    {
        var goal = await _service.CreateAsync(dto);
        return Created("", goal);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateGoalDto dto)
    {
        try { return Ok(await _service.UpdateAsync(id, dto)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Goal not found." }); }
    }

    [HttpPatch("{id}/progress")]
    public async Task<IActionResult> UpdateProgress(int id, [FromBody] UpdateGoalProgressDto dto)
    {
        try { return Ok(await _service.UpdateProgressAsync(id, dto)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Goal not found." }); }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}

