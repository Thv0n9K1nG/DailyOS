namespace LifeBoard.API.Models.Entities;

public class FocusSessionEntity
{
    public int Id { get; set; }
    public string SessionType { get; set; } = "stopwatch";
    public string? Label { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int DurationSeconds { get; set; }
    public DateTime SessionDate { get; set; }
    public string? Splits { get; set; }
    public DateTime CreatedAt { get; set; }

    // Stopwatch state machine fields
    /// <summary>Current lifecycle state: idle | running | paused | stopped</summary>
    public string StopwatchState { get; set; } = "stopped";
    /// <summary>Accumulated active seconds from prior completed running segments</summary>
    public int PausedDurationSeconds { get; set; } = 0;
    /// <summary>UTC moment when the current running segment began (null when paused or stopped)</summary>
    public DateTime? CurrentSegmentStart { get; set; }
}

