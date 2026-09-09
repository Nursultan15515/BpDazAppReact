using BpDaz.Api.Dto;

namespace BpDaz.Api.Services.Auth;

public interface IAuthService
{
    /// <summary>Проверяет логин и пароль. Возвращает null, если пара не подошла.</summary>
    Task<AuthenticatedUser?> VerifyPasswordAsync(string login, string password, CancellationToken ct);

    /// <summary>Данные пользователя для выпуска токена после refresh.</summary>
    Task<AuthenticatedUser?> GetByUserIdAsync(int userId, CancellationToken ct);

    /// <summary>Пользователь по доменной учётке (режим Windows).</summary>
    Task<AuthenticatedUser?> GetByAccountNameAsync(string accountName, CancellationToken ct);

    Task RegisterFailedAttemptAsync(string login, CancellationToken ct);

    /// <summary>Привязывает доменную учётку к существующему логину — как SetAccountNameByLogin.</summary>
    Task<LinkAccountResult> LinkAccountAsync(string login, string accountName, CancellationToken ct);

    /// <summary>Задаёт пароль. false — если у пользователя нет строки Users2.</summary>
    Task<bool> SetPasswordAsync(int userId, string password, CancellationToken ct);
}
