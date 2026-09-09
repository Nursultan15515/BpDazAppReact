namespace BpDaz.Api.Infrastructure.Auth;

/// <summary>
/// Токены живут в http-only cookie: JavaScript до них не дотягивается,
/// а браузер сам прикладывает их к запросам к API.
/// </summary>
public static class AuthCookies
{
    public const string AccessToken = "access_token";
    public const string RefreshToken = "refresh_token";

    public static void Write(HttpResponse response, string name, string token, DateTimeOffset expires)
    {
        response.Cookies.Append(name, token, new CookieOptions
        {
            HttpOnly = true,
            // В разработке фронтенд ходит по http через прокси Vite, поэтому Secure
            // включаем только для https-запросов.
            Secure = response.HttpContext.Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = expires,
            Path = "/",
        });
    }

    public static void Clear(HttpResponse response, string name)
    {
        response.Cookies.Delete(name, new CookieOptions
        {
            HttpOnly = true,
            Secure = response.HttpContext.Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/",
        });
    }
}
