namespace LifeBoard.API.Models.Entities;

public class TaskEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "medium";
    public string Status { get; set; } = "pending";
    public DateTime? Deadline { get; set; }
    public bool IsRecurring { get; set; }
    public string? RecurrenceType { get; set; }
    public DateTime? RecurrenceEndDate { get; set; }
    public int? ParentTaskId { get; set; }
    public DateTime? PlannedDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
