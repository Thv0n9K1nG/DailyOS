using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Models.Entities;
using LifeBoard.API.Repositories.Interfaces;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Services;

public class MoodEntryService(IMoodEntryRepository repository) : IMoodEntryService
{
    private readonly IMoodEntryRepository _repository = repository;

    public async Task<MoodEntryDto?> GetByDateAsync(DateTime date)
    {
        var e = await _repository.GetByDateAsync(date);
        if (e == null) return null;
        return new MoodEntryDto { Id = e.Id, EntryDate = e.EntryDate, Score = e.Score, Note = e.Note, CreatedAt = e.CreatedAt, UpdatedAt = e.UpdatedAt };
    }

    public async Task<IEnumerable<MoodEntryDto>> GetAllAsync()
    {
        var list = await _repository.GetAllAsync();
        return list.Select(e => new MoodEntryDto { Id = e.Id, EntryDate = e.EntryDate, Score = e.Score, Note = e.Note, CreatedAt = e.CreatedAt, UpdatedAt = e.UpdatedAt });
    }

    public async Task<MoodEntryDto> UpsertAsync(UpsertMoodEntryDto dto)
    {
        var entity = new MoodEntryEntity { EntryDate = dto.EntryDate.Date, Score = dto.Score, Note = dto.Note };
        var saved = await _repository.UpsertAsync(entity);
        return new MoodEntryDto { Id = saved.Id, EntryDate = saved.EntryDate, Score = saved.Score, Note = saved.Note, CreatedAt = saved.CreatedAt, UpdatedAt = saved.UpdatedAt };
    }

    public async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }
}
