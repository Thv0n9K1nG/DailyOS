using LifeBoard.API.Models.DTOs;

namespace LifeBoard.API.Services.Interfaces;

public interface IStopwatchService
{
    /// <summary>Returns the active (running or paused) stopwatch session, or null if none.</summary>
    Task<StopwatchStateDto?> GetCurrentAsync();

    /// <summary>Start a brand-new stopwatch session.</summary>
    Task<StopwatchStateDto> StartAsync(string? label, string? sessionDateStr = null);

    /// <summary>Pause the running session. Accumulates elapsed into PausedDurationSeconds.</summary>
    Task<StopwatchStateDto> PauseAsync();

    /// <summary>Resume a paused session. Resets StartTime to UtcNow for the new running segment.</summary>
    Task<StopwatchStateDto> ResumeAsync();

    /// <summary>Stop (finalize) the session. Sets state=stopped, calculates final durationSeconds.</summary>
    Task<StopwatchStateDto> StopAsync();

    /// <summary>Add a split marker to the current running session.</summary>
    Task<StopwatchStateDto> AddSplitAsync(string? note);

    /// <summary>Update the label of the active session.</summary>
    Task<StopwatchStateDto> UpdateLabelAsync(string label);
}
