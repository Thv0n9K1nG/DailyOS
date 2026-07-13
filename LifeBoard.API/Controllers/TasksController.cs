using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/tasks")]
public class TasksController(ILogger<TasksController> logger, ITaskService service) : ControllerBase
{
    private readonly ITaskService _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? priority, [FromQuery] DateTime? plannedDate, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        return Ok(await _service.GetTasksAsync(status, priority, plannedDate, search, page, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var task = await _service.GetByIdAsync(id);
        if (task == null) return NotFound();
        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto dto)
    {
        var task = await _service.CreateAsync(dto);
        return Created("", task);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskDto dto)
    {
        return Ok(await _service.UpdateAsync(id, dto));
    }

    [HttpPatch("{id}/complete")]
    public async Task<IActionResult> Complete(int id)
    {
        return Ok(await _service.CompleteAsync(id));
    }

    [HttpPatch("{id}/uncomplete")]
    public async Task<IActionResult> Uncomplete(int id)
    {
        return Ok(await _service.UncompleteAsync(id));
    }

    [HttpPatch("{id}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        return Ok(await _service.ArchiveAsync(id));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
