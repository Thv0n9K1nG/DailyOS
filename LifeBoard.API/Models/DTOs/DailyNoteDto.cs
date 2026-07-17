using FluentValidation;

namespace LifeBoard.API.Models.DTOs;

public class DailyNoteDto
{
    public int Id { get; set; }
    public DateTime NoteDate { get; set; }
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpsertDailyNoteDto
{
    public DateTime NoteDate { get; set; }
    public string? Content { get; set; }
}

public class UpsertDailyNoteDtoValidator : AbstractValidator<UpsertDailyNoteDto>
{
    public UpsertDailyNoteDtoValidator()
    {
        RuleFor(x => x.NoteDate).NotEmpty();
    }
}
