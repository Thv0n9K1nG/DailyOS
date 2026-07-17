using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/habits")]
public class HabitsController(ILogger<HabitsController> logger, IHabitService service) : ControllerBase
{
    private readonly IHabitService _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAllActive()
    {
        return Ok(await _service.GetAllActiveAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateHabitDto dto)
    {
        var habit = await _service.CreateAsync(dto);
        return Created("", habit);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateHabitDto dto)
    {
        return Ok(await _service.UpdateAsync(id, dto));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id)
    {
        await _service.DeactivateAsync(id);
        return Ok();
    }

    [HttpPost("{id}/checkins")]
    public async Task<IActionResult> Checkin(int id, [FromBody] CheckinPayload payload)
    {
        await _service.UpsertCheckinAsync(id, payload.Date, payload.IsCompleted);
        return Ok();
    }
}

public class CheckinPayload
{
    public DateTime Date { get; set; }
    public bool IsCompleted { get; set; }
}
