using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace BpDaz.Api.Infrastructure.Auth;

public interface ITokenService
{
    string CreateAccessToken(int userId, int? personId, string login, bool isAdmin);

    string CreateRefreshToken(int userId);

    /// <summary>Проверяет refresh-токен и возвращает Users.Id, либо null.</summary>
    int? ReadRefreshToken(string token);

    DateTimeOffset AccessTokenExpires { get; }

    DateTimeOffset RefreshTokenExpires { get; }
}

public class TokenService(IOptions<JwtSettings> options) : ITokenService
{
    private readonly JwtSettings _settings = options.Value;

    public DateTimeOffset AccessTokenExpires =>
        DateTimeOffset.UtcNow.AddMinutes(_settings.AccessTokenMinutes);

    public DateTimeOffset RefreshTokenExpires =>
        DateTimeOffset.UtcNow.AddDays(_settings.RefreshTokenDays);

    public string CreateAccessToken(int userId, int? personId, string login, bool isAdmin)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, login),
            new(AuthClaims.UserId, userId.ToString()),
            new(ClaimTypes.Role, isAdmin ? AppRoles.Admin : AppRoles.User),
        };

        if (personId.HasValue)
            claims.Add(new Claim(AuthClaims.PersonId, personId.Value.ToString()));

        return Write(claims, AccessTokenExpires);
    }

    public string CreateRefreshToken(int userId) => Write(
        [
            new Claim(AuthClaims.UserId, userId.ToString()),
            new Claim(AuthClaims.TokenType, AuthClaims.RefreshTokenType),
        ],
        RefreshTokenExpires);

    public int? ReadRefreshToken(string token)
    {
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _settings.Issuer,
            ValidateAudience = true,
            ValidAudience = _settings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = SigningKey(),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
        };

        try
        {
            var principal = new JwtSecurityTokenHandler().ValidateToken(token, parameters, out _);

            // Access-токен подписан тем же ключом, поэтому дополнительно проверяем тип:
            // иначе им можно было бы обновлять сессию бесконечно.
            if (principal.FindFirst(AuthClaims.TokenType)?.Value != AuthClaims.RefreshTokenType)
                return null;

            var userId = principal.FindFirst(AuthClaims.UserId)?.Value;
            return int.TryParse(userId, out var id) ? id : null;
        }
        catch
        {
            return null;
        }
    }

    private string Write(IEnumerable<Claim> claims, DateTimeOffset expires)
    {
        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: expires.UtcDateTime,
            signingCredentials: new SigningCredentials(SigningKey(), SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private SymmetricSecurityKey SigningKey() =>
        new(Encoding.UTF8.GetBytes(_settings.SecretKey));
}
