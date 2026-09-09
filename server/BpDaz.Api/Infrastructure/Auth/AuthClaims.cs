namespace BpDaz.Api.Infrastructure.Auth;

public static class AuthClaims
{
    /// <summary>Users.Id.</summary>
    public const string UserId = "uid";

    /// <summary>Persons.Id — по нему фильтруются «мои заявки».</summary>
    public const string PersonId = "pid";

    /// <summary>Отличает refresh-токен от access-токена.</summary>
    public const string TokenType = "typ_use";

    public const string RefreshTokenType = "refresh";
}

public static class AuthPolicies
{
    /// <summary>Пользователь опознан, но привязки к базе бюро пропусков может ещё не быть.</summary>
    public const string Authenticated = "Authenticated";

    /// <summary>Пользователь опознан и найден в базе — политика по умолчанию.</summary>
    public const string Linked = "Linked";
}

public static class AppRoles
{
    /// <summary>Роли повторяют Global.asax из BpDazApp: администратор берётся из Users2.IsAdmin.</summary>
    public const string Admin = "admin";

    public const string User = "user";
}
