using System.Text.Json.Serialization;
using BpDaz.Api.Data;
using BpDaz.Api.Infrastructure.CurrentUser;
using BpDaz.Api.Services.BlackList;
using BpDaz.Api.Services.Dicts;
using BpDaz.Api.Services.Persons;
using BpDaz.Api.Services.Requests;
using BpDaz.Api.Services.Users;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const string DevCorsPolicy = "DevCors";

builder.Services.AddControllers()
    // Статусы заявок ездят на фронт строками ("Current"), а не числами.
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.Configure<RouteOptions>(options => options.LowercaseUrls = true);
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

builder.Services.AddDbContext<VcEntities>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// ─── Application services ────────────────────────────────────────────────────
builder.Services.AddScoped<ICurrentUser, StubCurrentUser>();
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
        .AllowAnyMethod());
});

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors(DevCorsPolicy);
}
else
{
    app.UseHttpsRedirection();
}

app.MapHealthChecks("/health");
app.MapControllers();

app.Run();
