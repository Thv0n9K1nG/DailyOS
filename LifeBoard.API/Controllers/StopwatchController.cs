using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

/// <summary>
/// Backend-authoritative stopwatch state machine.
/// React must call GET /current on mount and use server timestamps to compute elapsed time.
/// All state transitions go through this controller — never trust client-provided elapsed duration.
/// </summary>
[ApiController]
[Route("api/v1/stopwatch")]
public class StopwatchController(IStopwatchService service) : ControllerBase
{
    private readonly IStopwatchService _service = service;

    /// <summary>
    /// GET /api/v1/stopwatch/current
    /// Returns the active (running or paused) stopwatch session.
    /// Returns 204 No Content when no session is active (idle state).
    /// React should call this on every page mount to reconstruct UI state.
    /// </summary>
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrent()
    {
        var state = await _service.GetCurrentAsync();
        return state == null ? NoContent() : Ok(state);
    }

    /// <summary>
    /// POST /api/v1/stopwatch/start
    /// Start a new stopwatch session. If a session is somehow already running,
    /// it will be finalized first (orphan cleanup).
    /// </summary>
    [HttpPost("start")]
    public async Task<IActionResult> Start([FromBody] StartStopwatchDto dto)
    {
        try
        {
            var state = await _service.StartAsync(dto.Label, dto.SessionDate);
            return Ok(state);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// POST /api/v1/stopwatch/pause
    /// Pause the currently running stopwatch. Accumulates elapsed time server-side.
    /// </summary>
    [HttpPost("pause")]
    public async Task<IActionResult> Pause()
    {
        try
        {
            var state = await _service.PauseAsync();
            return Ok(state);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// POST /api/v1/stopwatch/resume
    /// Resume a paused stopwatch. Sets a new segment start time server-side.
    /// </summary>
    [HttpPost("resume")]
    public async Task<IActionResult> Resume()
    {
        try
        {
            var state = await _service.ResumeAsync();
            return Ok(state);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// POST /api/v1/stopwatch/stop
    /// Finalize the session. Calculates total duration from server timestamps.
    /// Session moves to 'stopped' state and appears in history.
    /// </summary>
    [HttpPost("stop")]
    public async Task<IActionResult> Stop()
    {
        try
        {
            var state = await _service.StopAsync();
            return Ok(state);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// POST /api/v1/stopwatch/split
    /// Add a split marker to the active running session.
    /// </summary>
    [HttpPost("split")]
    public async Task<IActionResult> AddSplit([FromBody] StopwatchSplitDto dto)
    {
        try
        {
            var state = await _service.AddSplitAsync(dto.Note);
            return Ok(state);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    /// <summary>
    /// PATCH /api/v1/stopwatch/label
    /// Update the label of the active session without changing its state.
    /// </summary>
    [HttpPatch("label")]
    public async Task<IActionResult> UpdateLabel([FromBody] StopwatchLabelDto dto)
    {
        try
        {
            var state = await _service.UpdateLabelAsync(dto.Label);
            return Ok(state);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }
}
