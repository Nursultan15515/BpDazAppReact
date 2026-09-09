using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using BpDaz.Api.Data;
using BpDaz.Api.Infrastructure.Auth;
using BpDaz.Api.Infrastructure.CurrentUser;
using BpDaz.Api.Services.Auth;
using BpDaz.Api.Services.BlackList;
using BpDaz.Api.Services.Dicts;
using BpDaz.Api.Services.Persons;
using BpDaz.Api.Services.Requests;
using BpDaz.Api.Services.Users;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Negotiate;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

const string DevCorsPolicy = "DevCors";

AuthModes.EnsureValid(builder.Configuration);
var enableWindows = AuthModes.WindowsEnabled(builder.Configuration);
var enablePassword = AuthModes.PasswordEnabled(builder.Configuration);

builder.Services.AddControllers()
    // Статусы заявок ездят на фронт строками ("Current"), а не числами.
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.Configure<RouteOptions>(options => options.LowercaseUrls = true);
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddHttpContextAccessor();

builder.Services.AddDbContext<VcEntities>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// ─── Аутентификация ──────────────────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

// Схема по умолчанию: Negotiate, если включён доменный режим; иначе JWT.
var defaultScheme = enableWindows
    ? NegotiateDefaults.AuthenticationScheme
    : JwtBearerDefaults.AuthenticationScheme;

var authBuilder = builder.Services.AddAuthentication(defaultScheme);

if (enableWindows)
{
    authBuilder.AddNegotiate(options =>
    {
        // Без этого браузер показывает системное окно ввода доменных учётных данных.
        // Нам нужен обычный 401, чтобы фронтенд отрисовал свою форму входа.
        options.Events = new NegotiateEvents
        {
            OnChallenge = async ctx =>
            {
                ctx.HandleResponse();
                if (!ctx.Response.HasStarted)
                {
                    ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await ctx.Response.WriteAsJsonAsync(new { error = "unauthorized" });
                }
            },
        };
    });
}

if (enablePassword)
{
    authBuilder.AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = ClaimTypes.Role,
        };
        options.Events = new JwtBearerEvents
        {
            // Токен лежит в http-only cookie, а не в заголовке Authorization.
            OnMessageReceived = ctx =>
            {
                ctx.Token = ctx.Request.Cookies[AuthCookies.AccessToken];
                return Task.CompletedTask;
            },
            OnChallenge = async ctx =>
            {
                ctx.HandleResponse();
                if (!ctx.Response.HasStarted)
                {
                    ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await ctx.Response.WriteAsJsonAsync(new { error = "unauthorized" });
                }
            },
        };
    });
}

var schemes = new List<string>();
if (enableWindows) schemes.Add(NegotiateDefaults.AuthenticationScheme);
if (enablePassword) schemes.Add(JwtBearerDefaults.AuthenticationScheme);

var authenticatedPolicy = new AuthorizationPolicyBuilder([.. schemes])
    .RequireAuthenticatedUser()
    .Build();

// По умолчанию мало быть опознанным — нужна ещё привязка к строке Users.
var linkedPolicy = new AuthorizationPolicyBuilder([.. schemes])
    .RequireAuthenticatedUser()
    .RequireClaim(AuthClaims.UserId)
    .Build();

builder.Services.AddAuthorizationBuilder()
    .SetDefaultPolicy(linkedPolicy)
    .SetFallbackPolicy(linkedPolicy)
    .AddPolicy(AuthPolicies.Authenticated, authenticatedPolicy)
    .AddPolicy(AuthPolicies.Linked, linkedPolicy);

builder.Services.AddSingleton<IClaimsTransformation, WindowsClaimsTransformation>();
builder.Services.AddSingleton<ITokenService, TokenService>();

// ─── Application services ────────────────────────────────────────────────────
builder.Services.AddScoped<ICurrentUser, CurrentUserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRequestService, RequestService>();
builder.Services.AddScoped<IDictService, DictService>();
builder.Services.AddScoped<IPersonService, PersonService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBlackListService, BlackListService>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy(DevCorsPolicy, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        // Токены ездят в cookie, поэтому запросы должны идти с credentials.
        .AllowCredentials());
});

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
    app.UseCors(DevCorsPolicy);
}
else
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health").AllowAnonymous();
app.MapControllers();

app.Run();
