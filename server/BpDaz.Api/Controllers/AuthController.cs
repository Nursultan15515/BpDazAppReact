using BpDaz.Api.Dto;
using BpDaz.Api.Infrastructure.Auth;
using BpDaz.Api.Infrastructure.CurrentUser;
using BpDaz.Api.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BpDaz.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    IAuthService auth,
    ITokenService tokens,
    ICurrentUser currentUser,
    IConfiguration configuration) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginForm form, CancellationToken ct)
    {
        if (!AuthModes.PasswordEnabled(configuration))
            return BadRequest(Problem("Ошибка входа",
                "Вход по паролю выключен: сайт настроен на доменную аутентификацию."));

        var user = await auth.VerifyPasswordAsync(form.Login, form.Password, ct);

        if (user == null)
        {
            await auth.RegisterFailedAttemptAsync(form.Login, ct);

            // Не уточняем, что именно неверно — иначе форма подсказывает существующие логины.
            // Осмысленный текст кладём в detail: именно его показывает фронтенд.
            return Unauthorized(Problem("Ошибка входа", "Неверный логин или пароль."));
        }

        IssueTokens(user);
        return NoContent();
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        var token = Request.Cookies[AuthCookies.RefreshToken];
        if (string.IsNullOrEmpty(token))
            return Unauthorized();

        var userId = tokens.ReadRefreshToken(token);
        if (userId == null)
            return Unauthorized();

        var user = await auth.GetByUserIdAsync(userId.Value, ct);
        if (user == null)
            return Unauthorized();

        IssueTokens(user);
        return NoContent();
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        AuthCookies.Clear(Response, AuthCookies.AccessToken);
        AuthCookies.Clear(Response, AuthCookies.RefreshToken);
        return NoContent();
    }

    /// <summary>
    /// Привязка доменной учётки к логину — замена SetAccountNameByLogin из BpDazApp.
    /// Доступна пользователю, которого домен опознал, но в базе бюро пропусков ещё нет.
    /// </summary>
    [Authorize(Policy = AuthPolicies.Authenticated)]
    [HttpPost("link")]
    public async Task<IActionResult> Link(LinkAccountForm form, CancellationToken ct)
    {
        if (currentUser.IsLinked)
            return BadRequest(Problem("Учётная запись уже привязана", "Повторная привязка не нужна."));

        var accountName = currentUser.Name;
        if (string.IsNullOrEmpty(accountName))
            return Unauthorized();

        var result = await auth.LinkAccountAsync(form.Login, accountName, ct);

        return result switch
        {
            LinkAccountResult.Ok => NoContent(),
            LinkAccountResult.LoginNotFound => NotFound(
                Problem("Логин не найден", $"Не найден активный логин «{form.Login}».")),
            _ => Conflict(Problem("Логин занят", $"Логин «{form.Login}» уже привязан к другой учётной записи.")),
        };
    }

    private void IssueTokens(AuthenticatedUser user)
    {
        AuthCookies.Write(Response, AuthCookies.AccessToken,
            tokens.CreateAccessToken(user.UserId, user.PersonId, user.Login, user.IsAdmin),
            tokens.AccessTokenExpires);

        AuthCookies.Write(Response, AuthCookies.RefreshToken,
            tokens.CreateRefreshToken(user.UserId),
            tokens.RefreshTokenExpires);
    }

    private static ProblemDetails Problem(string title, string detail) =>
        new() { Title = title, Detail = detail };
}
