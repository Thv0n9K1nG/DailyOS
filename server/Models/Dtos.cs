using System.Text.Json.Serialization;

namespace LifeBoard.Models;

// All date fields in DTOs are plain "yyyy-MM-dd" strings — no ISO datetime, no timezone.

// ── Countdown DTOs ────────────────────────────────────────────────────────────
public record CountdownDto(
    int Id,
    string Title,
    string TargetDate,   // "yyyy-MM-dd"
    int DaysRemaining,
    string? Icon,
    string? Color);

public record CountdownRequest(
    string Title,
    string TargetDate,   // "yyyy-MM-dd" from client
    string? Icon,
    string? Color);

// ── Task DTOs ─────────────────────────────────────────────────────────────────
public record TaskDto(
    int Id,
    string Title,
    string? Note,
    string Priority,
    string Status,
    string PlannedDate,  // "yyyy-MM-dd"
    DateTime? CompletedAt,
    DateTime CreatedAt);

public record TaskRequest(
    string Title,
    string? Note,
    string Priority,
    string PlannedDate); // "yyyy-MM-dd"

public record TaskStatusRequest(string Status);

// ── Habit DTOs ────────────────────────────────────────────────────────────────
public record HabitDto(
    int Id,
    string Name,
    string? Description,
    string? Icon,
    string Color,
    bool IsActive,
    bool DoneToday);

public record HabitRequest(
    string Name,
    string? Description,
    string? Icon,
    string Color);

// ── Goal DTOs ─────────────────────────────────────────────────────────────────
public record GoalDto(
    int Id,
    string Title,
    string? Description,
    decimal CurrentValue,
    decimal TargetValue,
    string Unit,
    string? Deadline,    // "yyyy-MM-dd" or null
    string Status,
    double ProgressPct);

public record GoalRequest(
    string Title,
    string? Description,
    decimal TargetValue,
    string Unit,
    string? Deadline);   // "yyyy-MM-dd" or null

public record GoalProgressRequest(decimal CurrentValue);

// ── FocusSession DTOs ─────────────────────────────────────────────────────────
public record FocusSessionDto(
    int Id,
    string? Label,
    string SessionDate,  // "yyyy-MM-dd"
    DateTime StartTime,
    DateTime EndTime,
    int DurationSeconds,
    string? Splits,
    DateTime CreatedAt);

public record FocusSessionRequest(
    string? Label,
    string SessionDate,  // "yyyy-MM-dd"
    DateTime StartTime,
    DateTime EndTime,
    string? Splits);

public record FocusSessionUpdateRequest(
    string? Label,
    DateTime StartTime,
    DateTime EndTime,
    string? Splits);

// ── Note DTOs ─────────────────────────────────────────────────────────────────
public record NoteDto(
    int Id,
    string NoteDate,     // "yyyy-MM-dd"
    string? Content,
    DateTime UpdatedAt);

public record NoteRequest(
    string NoteDate,     // "yyyy-MM-dd"
    string? Content);

// ── Mood DTOs ─────────────────────────────────────────────────────────────────
public record MoodDto(
    int Id,
    string EntryDate,    // "yyyy-MM-dd"
    int Score,
    string? Note,
    DateTime UpdatedAt);

public record MoodRequest(
    string EntryDate,    // "yyyy-MM-dd"
    int Score,
    string? Note);

// ── Analytics DTOs ────────────────────────────────────────────────────────────
public record DailyStat(string Date, int FocusSeconds, int TasksDone, int MoodScore);
public record AnalyticsResponse(IEnumerable<DailyStat> Stats, int TotalFocusSeconds, int TotalTasksDone);
