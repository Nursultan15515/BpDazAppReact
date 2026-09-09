using System.Security.Claims;
using BpDaz.Api.Infrastructure.Auth;

namespace BpDaz.Api.Infrastructure.CurrentUser;

/// <summary>
/// Читает пользователя из claims. Для парольного режима их выпускает TokenService,
/// для доменного — добавляет WindowsClaimsTransformation, поэтому здесь нет обращений к БД.
/// </summary>
public class CurrentUserService(IHttpContextAccessor accessor) : ICurrentUser
{
    private ClaimsPrincipal? Principal => accessor.HttpContext?.User;

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated == true;

    public bool IsLinked => Principal?.FindFirst(AuthClaims.UserId) != null;

    public string Name => Principal?.Identity?.Name ?? "";

    public int UserId => ReadInt(AuthClaims.UserId);

    public int PersonId => ReadInt(AuthClaims.PersonId);

    public bool IsAdmin => Principal?.IsInRole(AppRoles.Admin) == true;

    private int ReadInt(string claimType)
    {
        var value = Principal?.FindFirst(claimType)?.Value;
        return int.TryParse(value, out var parsed) ? parsed : 0;
    }
}
