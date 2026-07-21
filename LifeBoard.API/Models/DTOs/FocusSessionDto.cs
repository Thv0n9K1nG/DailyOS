using FluentValidation;

namespace LifeBoard.API.Models.DTOs;

public class FocusSessionDto
{
    public int Id { get; set; }
    public string SessionType { get; set; } = "stopwatch";
    public string? Label { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int DurationSeconds { get; set; }
    public DateTime SessionDate { get; set; }
    public string? Splits { get; set; }
    public DateTime CreatedAt { get; set; }
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
