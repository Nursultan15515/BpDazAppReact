using System.Security.Claims;
using BpDaz.Api.Services.Auth;
using Microsoft.AspNetCore.Authentication;

namespace BpDaz.Api.Infrastructure.Auth;

/// <summary>
/// В доменном режиме Negotiate даёт только DOMAIN\user. Здесь по Users2.AccountName
/// достаём Users.Id, Persons.Id и роль — то же, что делал Application_PostAuthenticateRequest
/// в Global.asax у BpDazApp. Результат кладём в claims, чтобы остальной код не ходил в БД.
/// </summary>
public class WindowsClaimsTransformation(IServiceScopeFactory scopeFactory) : IClaimsTransformation
{
    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity?.IsAuthenticated != true)
            return principal;

        // Парольный режим уже принёс свои claims в токене.
        if (principal.FindFirst(AuthClaims.UserId) != null)
            return principal;

        var accountName = principal.Identity.Name;
        if (string.IsNullOrEmpty(accountName))
            return principal;

        using var scope = scopeFactory.CreateScope();
        var auth = scope.ServiceProvider.GetRequiredService<IAuthService>();

        var user = await auth.GetByAccountNameAsync(accountName, CancellationToken.None);
        if (user == null)
        {
            // Учётка не привязана к логину — пользователь аутентифицирован,
            // но работать в бюро пропусков ещё не может.
            return principal;
        }

        var identity = new ClaimsIdentity();
        identity.AddClaim(new Claim(AuthClaims.UserId, user.UserId.ToString()));
        if (user.PersonId.HasValue)
            identity.AddClaim(new Claim(AuthClaims.PersonId, user.PersonId.Value.ToString()));
        identity.AddClaim(new Claim(ClaimTypes.Role, user.IsAdmin ? AppRoles.Admin : AppRoles.User));

        principal.AddIdentity(identity);
        return principal;
    }
}
