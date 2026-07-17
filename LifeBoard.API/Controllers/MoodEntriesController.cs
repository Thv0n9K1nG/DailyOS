using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/mood-entries")]
public class MoodEntriesController(ILogger<MoodEntriesController> logger, IMoodEntryService service) : ControllerBase
{
    private readonly IMoodEntryService _service = service;

    [HttpGet("date/{date}")]
    public async Task<IActionResult> GetByDate(DateTime date)
    {
        var mood = await _service.GetByDateAsync(date);
        if (mood == null) return NotFound(new { message = "No mood entry for this date." });
        return Ok(mood);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Upsert([FromBody] UpsertMoodEntryDto dto)
    {
        var mood = await _service.UpsertAsync(dto);
        return Ok(mood);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
