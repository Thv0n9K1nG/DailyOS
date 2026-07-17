using FluentValidation;

namespace LifeBoard.API.Models.DTOs;

public class GoalDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal TargetValue { get; set; }
    public string Unit { get; set; } = string.Empty;
    public double ProgressPercent { get; set; }
    public DateTime? Deadline { get; set; }
    public string Status { get; set; } = "active";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateGoalDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal CurrentValue { get; set; } = 0;
    public decimal TargetValue { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime? Deadline { get; set; }
}

public class UpdateGoalDto : CreateGoalDto
{
    public string Status { get; set; } = "active";
}

public class UpdateGoalProgressDto
{
    public decimal CurrentValue { get; set; }
}

public class CreateGoalDtoValidator : AbstractValidator<CreateGoalDto>
{
    public CreateGoalDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(255);
        RuleFor(x => x.TargetValue).GreaterThan(0).WithMessage("TargetValue must be greater than 0.");
        RuleFor(x => x.Unit).NotEmpty().MaximumLength(50);
    }
}

public class UpdateGoalDtoValidator : AbstractValidator<UpdateGoalDto>
{
    public UpdateGoalDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(255);
        RuleFor(x => x.TargetValue).GreaterThan(0).WithMessage("TargetValue must be greater than 0.");
        RuleFor(x => x.Unit).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Status).Must(s => s == "active" || s == "completed" || s == "paused")
            .WithMessage("Status must be active, completed, or paused.");
    }
}
