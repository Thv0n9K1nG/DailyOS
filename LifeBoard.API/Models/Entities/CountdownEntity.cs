namespace LifeBoard.API.Models.Entities;

public class CountdownEntity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime TargetDate { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; } = "#6B7280";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
