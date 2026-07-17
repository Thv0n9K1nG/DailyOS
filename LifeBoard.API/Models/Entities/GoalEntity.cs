namespace LifeBoard.API.Models.Entities;

public class GoalEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal TargetValue { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime? Deadline { get; set; }
    public string Status { get; set; } = "active"; // active | completed | paused
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
