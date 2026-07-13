using FluentValidation;

namespace LifeBoard.API.Models.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "medium";
    public string Status { get; set; } = "pending";
    public DateTime? Deadline { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrenceType { get; set; }
    public DateTime? RecurrenceEndDate { get; set; }
    public DateTime? PlannedDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<TagDto> Tags { get; set; } = new();
}

public class CreateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "medium";
    public DateTime? Deadline { get; set; }
    public DateTime? PlannedDate { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrenceType { get; set; }
    public DateTime? RecurrenceEndDate { get; set; }
    public List<int> TagIds { get; set; } = new();
}

public class UpdateTaskDto : CreateTaskDto
{
}

public class CreateTaskDtoValidator : AbstractValidator<CreateTaskDto>
{
    public CreateTaskDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Priority).Must(p => p == "low" || p == "medium" || p == "high").WithMessage("Priority must be low, medium, or high.");
        RuleFor(x => x.RecurrenceType).NotNull().When(x => x.IsRecurring).WithMessage("Recurrence type is required when task is recurring.");
    }
}

public class UpdateTaskDtoValidator : AbstractValidator<UpdateTaskDto>
{
    public UpdateTaskDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Priority).Must(p => p == "low" || p == "medium" || p == "high").WithMessage("Priority must be low, medium, or high.");
        RuleFor(x => x.RecurrenceType).NotNull().When(x => x.IsRecurring).WithMessage("Recurrence type is required when task is recurring.");
    }
}
