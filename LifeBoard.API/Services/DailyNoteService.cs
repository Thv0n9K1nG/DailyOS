using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Services;

public class DailyNoteService(IDailyNoteRepository repository) : IDailyNoteService
{
    private readonly IDailyNoteRepository _repository = repository;

    public async Task<DailyNoteDto?> GetByDateAsync(DateTime date)
    {
        var e = await _repository.GetByDateAsync(date);
        if (e == null) return null;
        return new DailyNoteDto { Id = e.Id, NoteDate = e.NoteDate, Content = e.Content, CreatedAt = e.CreatedAt, UpdatedAt = e.UpdatedAt };
    }

    public async Task<IEnumerable<DailyNoteDto>> GetAllAsync()
    {
        var notes = await _repository.GetAllAsync();
        return notes.Select(e => new DailyNoteDto { Id = e.Id, NoteDate = e.NoteDate, Content = e.Content, CreatedAt = e.CreatedAt, UpdatedAt = e.UpdatedAt });
    }

    public async Task<DailyNoteDto> UpsertAsync(UpsertDailyNoteDto dto)
    {
        var entity = new DailyNoteEntity { NoteDate = dto.NoteDate.Date, Content = dto.Content };
        var saved = await _repository.UpsertAsync(entity);
        return new DailyNoteDto { Id = saved.Id, NoteDate = saved.NoteDate, Content = saved.Content, CreatedAt = saved.CreatedAt, UpdatedAt = saved.UpdatedAt };
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }
}
