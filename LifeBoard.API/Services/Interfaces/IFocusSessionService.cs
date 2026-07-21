using LifeBoard.API.Models.DTOs;

namespace LifeBoard.API.Services.Interfaces;

public interface IFocusSessionService
{
    Task<object> GetAllAsync(DateTime from, DateTime to, string? type);
    Task<FocusSessionDto> CreateAsync(CreateFocusSessionDto dto);
    Task<FocusSessionDto> UpdateAsync(int id, UpdateFocusSessionDto dto);
    Task DeleteAsync(int id);
}
