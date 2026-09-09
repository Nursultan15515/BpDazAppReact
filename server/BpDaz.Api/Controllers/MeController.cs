using BpDaz.Api.Data;
using BpDaz.Api.Infrastructure.CurrentUser;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BpDaz.Api.Controllers;

/// <summary>
/// Профиль текущего пользователя. Личность пока берётся из заглушки, а ФИО и логин —
/// уже из базы, поэтому при подключении аутентификации контракт не изменится.
/// </summary>
[ApiController]
[Route("api/me")]
public class MeController(VcEntities db, ICurrentUser currentUser) : ControllerBase
{
    public record MeResponse(int UserId, int PersonId, string Login, string Fio, bool IsAdmin);

    [HttpGet]
    public async Task<ActionResult<MeResponse>> Get(CancellationToken ct)
    {
        var user = await db.Users.AsNoTracking()
            .Where(u => u.Id == currentUser.UserId)
            .Select(u => new { u.Login, u.PersonId })
            .FirstOrDefaultAsync(ct);

        var fio = await db.Persons.AsNoTracking()
            .Where(p => p.Id == currentUser.PersonId)
            .Select(p => p.Fio)
            .FirstOrDefaultAsync(ct);

        return Ok(new MeResponse(
            currentUser.UserId,
            currentUser.PersonId,
            user?.Login ?? "",
            fio ?? "",
            currentUser.IsAdmin));
    }
}
