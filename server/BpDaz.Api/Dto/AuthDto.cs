using System.ComponentModel.DataAnnotations;

namespace BpDaz.Api.Dto;

/// <summary>Пользователь, прошедший проверку, — из него собираются claims токена.</summary>
public record AuthenticatedUser(int UserId, int? PersonId, string Login, string Fio, bool IsAdmin);

public record LoginForm
{
    [Required, StringLength(100, MinimumLength = 1)]
    public string Login { get; init; } = "";

    [Required, StringLength(200, MinimumLength = 1)]
    public string Password { get; init; } = "";
}

/// <summary>Привязка доменной учётки к логину — замена SetAccountNameByLogin.</summary>
public record LinkAccountForm
{
    [Required, StringLength(100, MinimumLength = 1)]
    public string Login { get; init; } = "";
}

public enum LinkAccountResult
{
    Ok,
    LoginNotFound,
    LoginAlreadyLinked
}

public record SetPasswordForm
{
    [Required, StringLength(200, MinimumLength = 6, ErrorMessage = "Пароль должен быть не короче 6 символов.")]
    public string Password { get; init; } = "";
}
