using FluentValidation;

namespace LifeBoard.API.Models.DTOs;

public class CountdownDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    /// <summary>Returns as yyyy-MM-dd string to avoid UTC timezone serialization issues</summary>
    public string TargetDate { get; set; } = string.Empty;
    public int DaysRemaining { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCountdownDto
{
    public string Title { get; set; } = string.Empty;
    /// <summary>Date as yyyy-MM-dd local string from client to avoid UTC offset issues</summary>
    public string TargetDate { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Color { get; set; }
}

public class UpdateCountdownDto : CreateCountdownDto {}

public class CreateCountdownDtoValidator : AbstractValidator<CreateCountdownDto>
{
    public CreateCountdownDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(255);
        RuleFor(x => x.TargetDate)
            .NotEmpty()
            .Matches(@"^\d{4}-\d{2}-\d{2}$")
            .WithMessage("TargetDate must be in yyyy-MM-dd format.");
    }
}
