using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Services;

public class FocusSessionService(IFocusSessionRepository repository) : IFocusSessionService
{
    private readonly IFocusSessionRepository _repository = repository;

    public async Task<object> GetAllAsync(DateTime from, DateTime to, string? type)
    {
        var sessions = await _repository.GetAllAsync(from, to);
        if (!string.IsNullOrEmpty(type))
        {
            sessions = sessions.Where(s => s.SessionType == type);
        }
        
        var list = sessions.ToList();
        var totalDuration = list.Sum(s => s.DurationSeconds);
        
        var dtos = list.Select(s => new FocusSessionDto
        {
            Id = s.Id, SessionType = s.SessionType, Label = s.Label, StartTime = s.StartTime,
            EndTime = s.EndTime, DurationSeconds = s.DurationSeconds, SessionDate = s.SessionDate,
            Splits = s.Splits, CreatedAt = s.CreatedAt
        });
        
        return new { data = dtos, totalDurationSeconds = totalDuration };
    }

    public async Task<FocusSessionDto> CreateAsync(CreateFocusSessionDto dto)
    {
        var duration = (int)(dto.EndTime - dto.StartTime).TotalSeconds;
        // Use client-supplied local date if provided; otherwise fall back to UTC StartTime date
        var sessionDate = !string.IsNullOrEmpty(dto.SessionDate)
            ? DateTime.ParseExact(dto.SessionDate, "yyyy-MM-dd", null)
            : dto.StartTime.Date;
        var entity = new FocusSessionEntity
        {
            SessionType = dto.SessionType, Label = dto.Label, StartTime = dto.StartTime, EndTime = dto.EndTime,
            DurationSeconds = duration > 0 ? duration : 0, SessionDate = sessionDate, Splits = dto.Splits
        };
        var created = await _repository.CreateAsync(entity);
        return new FocusSessionDto
        {
            Id = created.Id, SessionType = created.SessionType, Label = created.Label, StartTime = created.StartTime,
            EndTime = created.EndTime, DurationSeconds = created.DurationSeconds, SessionDate = created.SessionDate,
            Splits = created.Splits, CreatedAt = created.CreatedAt
        };
    }

    public async Task<FocusSessionDto> UpdateAsync(int id, UpdateFocusSessionDto dto)
    {
        var existing = await _repository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Focus session not found");
        var duration = (int)(dto.EndTime - dto.StartTime).TotalSeconds;
        // Use client-supplied local date if provided; otherwise fall back to UTC StartTime date
        var sessionDate = !string.IsNullOrEmpty(dto.SessionDate)
            ? DateTime.ParseExact(dto.SessionDate, "yyyy-MM-dd", null)
            : dto.StartTime.Date;
        
        existing.SessionType = dto.SessionType;
        existing.Label = dto.Label;
        existing.StartTime = dto.StartTime;
        existing.EndTime = dto.EndTime;
        existing.DurationSeconds = duration > 0 ? duration : 0;
        existing.SessionDate = sessionDate;
        existing.Splits = dto.Splits;
        
        var updated = await _repository.UpdateAsync(existing);
        return new FocusSessionDto
        {
            Id = updated.Id, SessionType = updated.SessionType, Label = updated.Label, StartTime = updated.StartTime,
            EndTime = updated.EndTime, DurationSeconds = updated.DurationSeconds, SessionDate = updated.SessionDate,
            Splits = updated.Splits, CreatedAt = updated.CreatedAt
        };
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }
}
