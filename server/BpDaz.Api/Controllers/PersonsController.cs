using BpDaz.Api.Dto;
using BpDaz.Api.Services.Persons;
using Microsoft.AspNetCore.Mvc;

namespace BpDaz.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonsController(IPersonService persons) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PersonListItem>>> GetList(
        [FromQuery] string? search, CancellationToken ct)
        => Ok(await persons.GetListAsync(search, ct));

    [HttpPost]
    public async Task<IActionResult> Create(CreatePersonForm form, CancellationToken ct)
    {
        var result = await persons.CreateAsync(form, ct);

        return result switch
        {
            SaveResult.Ok => NoContent(),
            SaveResult.LoginTaken => Conflict(new ProblemDetails
            {
                Title = "Логин занят",
                Detail = $"Логин «{form.Login}» уже используется.",
                Status = StatusCodes.Status409Conflict,
            }),
            SaveResult.AccountTaken => Conflict(new ProblemDetails
            {
                Title = "Учётная запись занята",
                Detail = $"Доменная учётная запись «{form.AccountName}» уже привязана.",
                Status = StatusCodes.Status409Conflict,
            }),
            _ => NotFound(),
        };
    }
}
