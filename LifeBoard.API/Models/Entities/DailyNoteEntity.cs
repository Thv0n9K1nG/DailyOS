namespace LifeBoard.API.Models.Entities;

public class DailyNoteEntity
{
    public int Id { get; set; }
    public DateTime NoteDate { get; set; }
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
