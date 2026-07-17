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
        var entity = new FocusSessionEntity
        {
            SessionType = dto.SessionType, Label = dto.Label, StartTime = dto.StartTime, EndTime = dto.EndTime,
            DurationSeconds = duration > 0 ? duration : 0, SessionDate = dto.StartTime.Date, Splits = dto.Splits
        };
        var created = await _repository.CreateAsync(entity);
        return new FocusSessionDto
        {
            Id = created.Id, SessionType = created.SessionType, Label = created.Label, StartTime = created.StartTime,
            EndTime = created.EndTime, DurationSeconds = created.DurationSeconds, SessionDate = created.SessionDate,
            Splits = created.Splits, CreatedAt = created.CreatedAt
        };
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }
}
