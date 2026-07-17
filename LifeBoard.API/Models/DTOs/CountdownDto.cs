using FluentValidation;

namespace LifeBoard.API.Models.DTOs;

public class CountdownDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime TargetDate { get; set; }
    public int DaysRemaining { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCountdownDto
{
    public string Title { get; set; } = string.Empty;
    public DateTime TargetDate { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
}

public class UpdateCountdownDto : CreateCountdownDto {}

public class CreateCountdownDtoValidator : AbstractValidator<CreateCountdownDto>
{
    public CreateCountdownDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(255);
        RuleFor(x => x.TargetDate).NotEmpty();
    }
}
