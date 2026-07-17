namespace LifeBoard.API.Models.Entities;

public class FocusSessionEntity
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
