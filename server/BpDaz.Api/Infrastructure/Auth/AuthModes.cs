namespace BpDaz.Api.Infrastructure.Auth;

/// <summary>
/// Auth:Mode задаётся per-site: Windows (только домен), Password (только логин-пароль)
/// или Both. Повторяет AuthMode из Web.config у BpDazApp.
/// </summary>
public static class AuthModes
{
    public const string Windows = "Windows";
    public const string Password = "Password";
    public const string Both = "Both";

    public static string Read(IConfiguration configuration) =>
        configuration["Auth:Mode"] ?? Both;

    public static bool WindowsEnabled(IConfiguration configuration) =>
        Read(configuration) is Windows or Both;

    public static bool PasswordEnabled(IConfiguration configuration) =>
        Read(configuration) is Password or Both;

    /// <summary>
    /// Несогласованный режим раньше молча превращался в цикл редиректов,
    /// поэтому падаем на старте — как EnsureConfigurationIsConsistent в BpDazApp.
    /// </summary>
    public static void EnsureValid(IConfiguration configuration)
    {
        var mode = Read(configuration);

        if (mode is not (Windows or Password or Both))
            throw new InvalidOperationException(
                $"Auth:Mode=\"{mode}\" недопустим. Используйте \"{Windows}\", \"{Password}\" или \"{Both}\".");
    }
}
