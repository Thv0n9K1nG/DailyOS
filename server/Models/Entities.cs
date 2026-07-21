namespace LifeBoard.Models;

// ── Countdown ─────────────────────────────────────────────────────────────────
public class Countdown
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public DateOnly TargetDate { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// ── Task ──────────────────────────────────────────────────────────────────────
public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Note { get; set; }
    public string Priority { get; set; } = "medium";
    public string Status { get; set; } = "pending";
    public DateOnly PlannedDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// ── Habit ─────────────────────────────────────────────────────────────────────
public class Habit
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string Color { get; set; } = "#6B7280";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
}

public class HabitLog
{
    public int Id { get; set; }
    public int HabitId { get; set; }
    public DateOnly LogDate { get; set; }
    public bool Done { get; set; }
}

// ── Goal ──────────────────────────────────────────────────────────────────────
public class Goal
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public decimal CurrentValue { get; set; }
    public decimal TargetValue { get; set; }
    public string Unit { get; set; } = "";
    public DateOnly? Deadline { get; set; }
    public string Status { get; set; } = "active";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// ── FocusSession ──────────────────────────────────────────────────────────────
public class FocusSession
{
    public int Id { get; set; }
    public string? Label { get; set; }
    public DateOnly SessionDate { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int DurationSeconds { get; set; }
    public string? Splits { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── DailyNote ─────────────────────────────────────────────────────────────────
public class DailyNote
{
    public int Id { get; set; }
    public DateOnly NoteDate { get; set; }
    public string? Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// ── MoodEntry ─────────────────────────────────────────────────────────────────
public class MoodEntry
{
    public int Id { get; set; }
    public DateOnly EntryDate { get; set; }
    public int Score { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
