using FluentValidation;

namespace LifeBoard.API.Models.DTOs;

public class MoodEntryDto
{
    public int Id { get; set; }
    public DateTime EntryDate { get; set; }
    public int Score { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpsertMoodEntryDto
{
    public DateTime EntryDate { get; set; }
    public int Score { get; set; }
    public string? Note { get; set; }
}

public class UpsertMoodEntryDtoValidator : AbstractValidator<UpsertMoodEntryDto>
{
    public UpsertMoodEntryDtoValidator()
    {
        RuleFor(x => x.EntryDate).NotEmpty();
        RuleFor(x => x.Score).InclusiveBetween(1, 5).WithMessage("Score must be between 1 and 5.");
        RuleFor(x => x.Note).MaximumLength(500);
    }
}
