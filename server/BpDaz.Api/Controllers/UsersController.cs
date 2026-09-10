using BpDaz.Api.Dto;
using BpDaz.Api.Services.Auth;
using BpDaz.Api.Services.Users;
using BpDaz.Api.Infrastructure.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BpDaz.Api.Controllers;

[ApiController]
// Справочники и чёрный список в BpDazApp были доступны только администратору.
[Authorize(Roles = AppRoles.Admin)]
[Route("api/[controller]")]
public class UsersController(IUserService users, IAuthService auth) : ControllerBase
{
    /// <summary>Задаёт пароль пользователю — поле «Новый пароль» из EditUser в BpDazApp.</summary>
    [HttpPut("{id:int}/password")]
    public async Task<IActionResult> SetPassword(int id, SetPasswordForm form, CancellationToken ct) =>
        await auth.SetPasswordAsync(id, form.Password, ct) ? NoContent() : NotFound();

    [HttpGet]
    public async Task<ActionResult<PagedResult<UserListItem>>> GetList(
        CancellationToken ct,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = Paging.DefaultPageSize)
        => Ok(await users.GetListAsync(search, page, pageSize, ct));

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
