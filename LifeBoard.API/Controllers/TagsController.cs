using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/tags")]
public class TagsController(ILogger<TagsController> logger, ITagService service) : ControllerBase
{
    private readonly ITagService _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTagDto dto)
    {
        var tag = await _service.CreateAsync(dto);
        return Created("", tag);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTagDto dto)
    {
        return Ok(await _service.UpdateAsync(id, dto));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
