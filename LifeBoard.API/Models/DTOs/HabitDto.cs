using FluentValidation;

namespace LifeBoard.API.Models.DTOs;

public class HabitDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Frequency { get; set; } = "daily";
    public string Icon { get; set; } = "📌";
    public string Color { get; set; } = "#3D8EF0";
    public bool IsActive { get; set; }
    public int Streak { get; set; }
    public bool CheckedInToday { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateHabitDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Frequency { get; set; } = "daily";
    public string Icon { get; set; } = "📌";
    public string Color { get; set; } = "#3D8EF0";
}

public class UpdateHabitDto : CreateHabitDto {}

public class CreateHabitDtoValidator : AbstractValidator<CreateHabitDto>
{
    public CreateHabitDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Frequency).Must(f => f == "daily" || f == "weekly" || f == "monthly");
    }
}
