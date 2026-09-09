namespace BpDaz.Api.Infrastructure.Auth;

public class JwtSettings
{
    public string SecretKey { get; set; } = "";

    public string Issuer { get; set; } = "BpDaz";

    public string Audience { get; set; } = "BpDaz";

    public int AccessTokenMinutes { get; set; } = 30;

    public int RefreshTokenDays { get; set; } = 7;
}
