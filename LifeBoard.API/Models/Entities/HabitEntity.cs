namespace LifeBoard.API.Models.Entities;

public class HabitEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Frequency { get; set; } = "daily";
    public string Icon { get; set; } = "📌";
    public string Color { get; set; } = "#3D8EF0";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
}

public class HabitCheckInEntity
{
    public int Id { get; set; }
    public int HabitId { get; set; }
    public DateTime CheckinDate { get; set; }
    public bool IsCompleted { get; set; }
}
