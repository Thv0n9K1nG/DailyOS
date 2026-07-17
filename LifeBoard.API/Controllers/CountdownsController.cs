using Microsoft.AspNetCore.Mvc;
using LifeBoard.API.Models.DTOs;
using LifeBoard.API.Services.Interfaces;

namespace LifeBoard.API.Controllers;

[ApiController]
[Route("api/v1/countdowns")]
public class CountdownsController(ILogger<CountdownsController> logger, ICountdownService service) : ControllerBase
{
    private readonly ICountdownService _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCountdownDto dto)
    {
        var countdown = await _service.CreateAsync(dto);
        return Created("", countdown);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCountdownDto dto)
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
