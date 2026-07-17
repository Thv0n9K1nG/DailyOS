using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/daily-notes")]
public class DailyNotesController(ILogger<DailyNotesController> logger, IDailyNoteService service) : ControllerBase
{
    private readonly IDailyNoteService _service = service;

    [HttpGet("date/{date}")]
    public async Task<IActionResult> GetByDate(DateTime date)
    {
        var note = await _service.GetByDateAsync(date);
        if (note == null) return NotFound(new { message = "No note for this date." });
        return Ok(note);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Upsert([FromBody] UpsertDailyNoteDto dto)
    {
        var note = await _service.UpsertAsync(dto);
        return Ok(note);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
