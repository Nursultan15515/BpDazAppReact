using BpDaz.Api.Dto;
using BpDaz.Api.Services.Users;
using Microsoft.AspNetCore.Mvc;

namespace BpDaz.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService users) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserListItem>>> GetList(
        [FromQuery] string? search, CancellationToken ct)
        => Ok(await users.GetListAsync(search, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserEditItem>> GetById(int id, CancellationToken ct) =>
        await users.GetForEditAsync(id, ct) is { } item ? Ok(item) : NotFound();

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UserEditForm form, CancellationToken ct)
    {
        var result = await users.UpdateAsync(id, form, ct);

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
