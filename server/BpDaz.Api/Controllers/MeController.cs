using BpDaz.Api.Data;
using BpDaz.Api.Infrastructure.Auth;
using BpDaz.Api.Infrastructure.CurrentUser;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BpDaz.Api.Controllers;

[ApiController]
[Route("api/me")]
public class MeController(
    VcEntities db,
    ICurrentUser currentUser,
    IConfiguration configuration) : ControllerBase
{
    public record MeResponse(
        int UserId,
        int PersonId,
        string Login,
        string Fio,
        bool IsAdmin,
        bool IsLinked,
        string AccountName,
        string AuthMode);

    /// <summary>
    /// Профиль текущего пользователя. Доменный пользователь без привязки к логину
    /// получает IsLinked = false — фронтенд показывает ему форму привязки.
    /// </summary>
    [Authorize(Policy = AuthPolicies.Authenticated)]
    [HttpGet]
    public async Task<ActionResult<MeResponse>> Get(CancellationToken ct)
    {
        var authMode = AuthModes.Read(configuration);

        if (!currentUser.IsLinked)
        {
            return Ok(new MeResponse(
                0, 0, "", "", false, IsLinked: false, currentUser.Name, authMode));
        }

        var user = await db.Users.AsNoTracking()
            .Where(u => u.Id == currentUser.UserId)
            .Select(u => new
            {
                u.Login,
                Fio = u.Person == null ? "" : (u.Person.Fio ?? ""),
                AccountName = db.Users2s.Where(x => x.UserId == u.Id)
                    .Select(x => x.AccountName).FirstOrDefault(),
            })
            .FirstOrDefaultAsync(ct);

        return Ok(new MeResponse(
            currentUser.UserId,
            currentUser.PersonId,
            user?.Login ?? "",
            user?.Fio ?? "",
            currentUser.IsAdmin,
            IsLinked: true,
            user?.AccountName ?? currentUser.Name,
            authMode));
    }

    /// <summary>Режим входа нужен форме логина до аутентификации.</summary>
    [AllowAnonymous]
    [HttpGet("auth-mode")]
    public ActionResult<object> GetAuthMode() =>
        Ok(new { authMode = AuthModes.Read(configuration) });
}
