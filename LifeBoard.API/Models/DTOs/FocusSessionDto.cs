using FluentValidation;

namespace LifeBoard.API.Models.DTOs;

public class FocusSessionDto
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
    public string StopwatchState { get; set; } = "stopped";
    public int PausedDurationSeconds { get; set; }
}

/// <summary>
/// Response body for GET /stopwatch/current.
/// Contains everything React needs to reconstruct the running clock.
/// </summary>
public class StopwatchStateDto
{
    public int Id { get; set; }
    public string State { get; set; } = "idle";   // running | paused | stopped | idle
    public string? Label { get; set; }
    /// <summary>UTC timestamp of when this running segment started (for running state)</summary>
    public DateTime? SegmentStartedAt { get; set; }
    /// <summary>Total accumulated elapsed seconds before this segment</summary>
    public int AccumulatedSeconds { get; set; }
    public string? Splits { get; set; }
    public DateTime? SessionDate { get; set; }
}

public class StartStopwatchDto
{
    public string? Label { get; set; }
    public string? SessionDate { get; set; } // yyyy-MM-dd local date from client
}

public class StopwatchSplitDto
{
    public string? Note { get; set; }
}

public class StopwatchLabelDto
{
    public string Label { get; set; } = string.Empty;
}

public class CreateFocusSessionDto
{
    public string SessionType { get; set; } = "stopwatch";
    public string? Label { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? SessionDate { get; set; }  // local date as yyyy-MM-dd from client
    public string? Splits { get; set; }
}

public class UpdateFocusSessionDto
{
    public string SessionType { get; set; } = "stopwatch";
    public string? Label { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? SessionDate { get; set; }  // local date as yyyy-MM-dd from client
    public string? Splits { get; set; }
}

public class CreateFocusSessionDtoValidator : AbstractValidator<CreateFocusSessionDto>
{
    public CreateFocusSessionDtoValidator()
    {
        RuleFor(x => x.SessionType).NotEmpty();
        RuleFor(x => x.EndTime).GreaterThan(x => x.StartTime).WithMessage("EndTime must be after StartTime.");
    }
}


