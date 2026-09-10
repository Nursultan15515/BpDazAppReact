using BpDaz.Api.Dto;
using BpDaz.Api.Services.Requests;
using Microsoft.AspNetCore.Mvc;

namespace BpDaz.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RequestsController(IRequestService requests) : ControllerBase
{
    /// <summary>Страница списка заявок. Без дат отдаёт последние три дня.</summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<RequestListItem>>> GetList(
        CancellationToken ct,
        [FromQuery] RequestFilterMode mode = RequestFilterMode.All,
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null,
        [FromQuery] bool onlyMine = false,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = Paging.DefaultPageSize)
        => Ok(await requests.GetListAsync(mode, dateFrom, dateTo, onlyMine, search, page, pageSize, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RequestDetails>> GetById(int id, CancellationToken ct) =>
        await requests.GetByIdAsync(id, ct) is { } details ? Ok(details) : NotFound();

    /// <summary>Фото посетителя, снятое на посту при выдаче карты.</summary>
    [HttpGet("{id:int}/photo")]
    public async Task<IActionResult> GetPhoto(int id, CancellationToken ct) =>
        await requests.GetPhotoAsync(id, ct) is { } photo
            ? File(photo.Content, photo.ContentType)
            : NotFound();

    [HttpPost]
    public async Task<ActionResult<RequestDetails>> Create(CreateRequestForm form, CancellationToken ct)
    {
        var result = await requests.CreateAsync(form, ct);

        if (result.VisitorBlacklisted)
            return Conflict(new ProblemDetails
            {
                Title = "Посетитель в чёрном списке",
                Detail = $"Посетитель с ИИН {form.Iin} числится в чёрном списке, заявка не создана.",
                Status = StatusCodes.Status409Conflict,
            });

        var created = result.Details!;
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await requests.DeleteAsync(id, ct) ? NoContent() : NotFound();
}
