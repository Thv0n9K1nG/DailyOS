namespace LifeBoard.API.Models.Entities;

public class MoodEntryEntity
{
    public int Id { get; set; }
    public DateTime EntryDate { get; set; }
    public int Score { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
