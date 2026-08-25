using System.Text.Json;
using System.Text.Json.Serialization;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Services;

public class StopwatchService(IFocusSessionRepository repository) : IStopwatchService
{
    private readonly IFocusSessionRepository _repository = repository;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    // ── Helpers ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Maps a FocusSessionEntity to StopwatchStateDto.
    /// </summary>
    private static StopwatchStateDto ToDto(FocusSessionEntity s)
    {
        DateTime? utcSegmentStart = s.CurrentSegmentStart.HasValue
            ? DateTime.SpecifyKind(s.CurrentSegmentStart.Value, DateTimeKind.Utc)
            : null;

        return new StopwatchStateDto
        {
            Id                 = s.Id,
            State              = s.StopwatchState,
            Label              = s.Label,
            SegmentStartedAt   = s.StopwatchState == "running" ? utcSegmentStart : null,
            AccumulatedSeconds = s.StopwatchState == "running" ? s.PausedDurationSeconds
                               : s.StopwatchState == "paused"  ? s.PausedDurationSeconds
                               : s.DurationSeconds,
            Splits             = s.Splits,
            SessionDate        = DateTime.SpecifyKind(s.SessionDate, DateTimeKind.Utc),
        };
    }

    private static int CalcCurrentActiveSeconds(FocusSessionEntity s, DateTime now)
    {
        var priorActive = s.PausedDurationSeconds;
        if (s.StopwatchState == "running" && s.CurrentSegmentStart.HasValue)
        {
            var currentSegmentSec = (int)(now - s.CurrentSegmentStart.Value).TotalSeconds;
            return priorActive + (currentSegmentSec > 0 ? currentSegmentSec : 0);
        }
        return priorActive;
    }

    private static void AppendSplit(FocusSessionEntity session, DateTime now, string? note = null)
    {
        var totalElapsedSec = CalcCurrentActiveSeconds(session, now);
        var splits = string.IsNullOrEmpty(session.Splits)
            ? []
            : JsonSerializer.Deserialize<List<SplitRecord>>(session.Splits, JsonOptions) ?? [];

        int prevElapsedSec = 0;
        if (splits.Count > 0)
        {
            var lastSplit = splits.Last();
            prevElapsedSec = lastSplit.ElapsedSec > 0 ? lastSplit.ElapsedSec : ParseSecondsFromFormatted(lastSplit.Elapsed);
        }
        int lapSec = Math.Max(0, totalElapsedSec - prevElapsedSec);

        splits.Add(new SplitRecord
        {
            Id         = splits.Count + 1,
            Interval   = FormatTime(lapSec),
            Elapsed    = FormatTime(totalElapsedSec),
            ElapsedSec = totalElapsedSec,
            Timestamp  = DateTime.SpecifyKind(now, DateTimeKind.Utc).ToString("o"),
            Note       = note?.Trim(),
        });
        session.Splits = JsonSerializer.Serialize(splits, JsonOptions);
    }

    // ── Public API ────────────────────────────────────────────────────────────

    public async Task<StopwatchStateDto?> GetCurrentAsync()
    {
        var session = await _repository.GetActiveStopwatchAsync();
        return session == null ? null : ToDto(session);
    }

    public async Task<StopwatchStateDto> StartAsync(string? label, string? sessionDateStr = null)
    {
        // Orphan cleanup: finalize any lingering active session cleanly without throwing error
        var orphan = await _repository.GetActiveStopwatchAsync();
        if (orphan != null)
        {
            var orphanNow = DateTime.UtcNow;
            orphan.StopwatchState = "stopped";
            orphan.EndTime = orphanNow;
            orphan.DurationSeconds = CalcCurrentActiveSeconds(orphan, orphanNow);
            orphan.CurrentSegmentStart = null;
            await _repository.UpdateAsync(orphan);
        }

        var now = DateTime.UtcNow;
        DateTime sessionDate;
        if (!string.IsNullOrEmpty(sessionDateStr) &&
            DateTime.TryParseExact(sessionDateStr, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var parsedDate))
        {
            sessionDate = parsedDate;
        }
        else
        {
            sessionDate = now.Date;
        }

        var entity = new FocusSessionEntity
        {
            SessionType           = "stopwatch",
            Label                 = label?.Trim(),
            StartTime             = now,
            EndTime               = null,
            DurationSeconds       = 0,
            SessionDate           = sessionDate,
            StopwatchState        = "running",
            PausedDurationSeconds = 0,
            CurrentSegmentStart   = now,
        };
        var created = await _repository.CreateAsync(entity);
        return ToDto(created);
    }

    public async Task<StopwatchStateDto> PauseAsync()
    {
        var session = await _repository.GetActiveStopwatchAsync()
            ?? throw new InvalidOperationException("No active stopwatch session to pause.");

        if (session.StopwatchState != "running")
            throw new InvalidOperationException($"Cannot pause from state '{session.StopwatchState}'.");

        var now = DateTime.UtcNow;

        // 1. Automatically record a sub-session split for this completed running segment
        AppendSplit(session, now, "Tạm dừng");

        // 2. Accumulate active duration
        if (session.CurrentSegmentStart.HasValue)
        {
            var segmentSec = (int)(now - session.CurrentSegmentStart.Value).TotalSeconds;
            if (segmentSec > 0) session.PausedDurationSeconds += segmentSec;
        }

        session.StopwatchState      = "paused";
        session.CurrentSegmentStart = null;

        var updated = await _repository.UpdateAsync(session);
        return ToDto(updated);
    }

    public async Task<StopwatchStateDto> ResumeAsync()
    {
        var session = await _repository.GetActiveStopwatchAsync()
            ?? throw new InvalidOperationException("No active stopwatch session to resume.");

        if (session.StopwatchState != "paused")
            throw new InvalidOperationException($"Cannot resume from state '{session.StopwatchState}'.");

        // Permanent StartTime is preserved! We only update CurrentSegmentStart for this new running segment.
        var now = DateTime.UtcNow;
        session.CurrentSegmentStart = now;
        session.StopwatchState      = "running";

        var updated = await _repository.UpdateAsync(session);
        return ToDto(updated);
    }

    public async Task<StopwatchStateDto> StopAsync()
    {
        var session = await _repository.GetActiveStopwatchAsync()
            ?? throw new InvalidOperationException("No active stopwatch session to stop.");

        if (session.StopwatchState is not ("running" or "paused"))
            throw new InvalidOperationException($"Cannot stop from state '{session.StopwatchState}'.");

        var now = DateTime.UtcNow;
        var totalActive = CalcCurrentActiveSeconds(session, now);

        if (session.StopwatchState == "running")
        {
            // If stopping while running, record final sub-session split marker
            AppendSplit(session, now, "Reset");
        }

        session.StopwatchState      = "stopped";
        session.EndTime             = now;
        session.DurationSeconds     = totalActive > 0 ? totalActive : 0;
        session.CurrentSegmentStart = null;

        var updated = await _repository.UpdateAsync(session);
        return ToDto(updated);
    }

    public async Task<StopwatchStateDto> AddSplitAsync(string? note)
    {
        var session = await _repository.GetActiveStopwatchAsync()
            ?? throw new InvalidOperationException("No active stopwatch session.");

        if (session.StopwatchState != "running")
            throw new InvalidOperationException("Can only add a split when the stopwatch is running.");

        var now = DateTime.UtcNow;
        AppendSplit(session, now, note ?? "Split");

        var updated = await _repository.UpdateAsync(session);
        return ToDto(updated);
    }

    public async Task<StopwatchStateDto> UpdateLabelAsync(string label)
    {
        var session = await _repository.GetActiveStopwatchAsync()
            ?? throw new InvalidOperationException("No active stopwatch session.");

        session.Label = label.Trim();
        var updated = await _repository.UpdateAsync(session);
        return ToDto(updated);
    }

    private static string FormatTime(int totalSec)
    {
        var h = totalSec / 3600;
        var m = (totalSec % 3600) / 60;
        var s = totalSec % 60;
        return $"{h:D2}:{m:D2}:{s:D2}";
    }

    private static int ParseSecondsFromFormatted(string? fmt)
    {
        if (string.IsNullOrEmpty(fmt)) return 0;
        var parts = fmt.Split(':');
        if (parts.Length == 3 && int.TryParse(parts[0], out var h) && int.TryParse(parts[1], out var m) && int.TryParse(parts[2], out var s))
        {
            return h * 3600 + m * 60 + s;
        }
        return 0;
    }

    // ── Internal record ───────────────────────────────────────────────────────
    private record SplitRecord
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("interval")]
        public string Interval { get; init; } = "";

        [JsonPropertyName("elapsed")]
        public string Elapsed { get; init; } = "";

        [JsonPropertyName("elapsedSec")]
        public int ElapsedSec { get; init; }

        [JsonPropertyName("timestamp")]
        public string Timestamp { get; init; } = "";

        [JsonPropertyName("note")]
        public string? Note { get; init; }
    }
}

