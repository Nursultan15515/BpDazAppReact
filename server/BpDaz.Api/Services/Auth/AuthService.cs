using BpDaz.Api.Data;
using BpDaz.Api.Data.Entities;
using BpDaz.Api.Dto;
using Microsoft.EntityFrameworkCore;

namespace BpDaz.Api.Services.Auth;

public class AuthService(VcEntities db) : IAuthService
{
    public async Task<AuthenticatedUser?> VerifyPasswordAsync(
        string login, string password, CancellationToken ct)
    {
        login = (login ?? "").Trim();

        if (login == "" || string.IsNullOrEmpty(password))
            return null;

        var row = await db.Users.AsNoTracking()
            .Where(u => u.Login == login && u.Status == 1)
            .Select(u => new
            {
                User = u,
                Fio = u.Person == null ? null : u.Person.Fio,
                Users2 = db.Users2s.Where(x => x.UserId == u.Id).FirstOrDefault(),
            })
            .FirstOrDefaultAsync(ct);

        if (row?.Users2 == null || string.IsNullOrEmpty(row.Users2.PasswordHash))
            return null;

        if (!BCrypt.Net.BCrypt.Verify(password, row.Users2.PasswordHash))
            return null;

        return new AuthenticatedUser(
            row.User.Id,
            row.User.PersonId,
            row.User.Login ?? "",
            row.Fio ?? "",
            row.Users2.IsAdmin);
    }

    // Фильтр обязан стоять до Select: Where поверх готового DTO EF Core не переводит.
    public Task<AuthenticatedUser?> GetByUserIdAsync(int userId, CancellationToken ct) =>
        db.Users.AsNoTracking()
            .Where(u => u.Id == userId && u.Status == 1)
            .Select(u => new AuthenticatedUser(
                u.Id,
                u.PersonId,
                u.Login ?? "",
                u.Person == null ? "" : (u.Person.Fio ?? ""),
                db.Users2s.Where(x => x.UserId == u.Id).Select(x => x.IsAdmin).FirstOrDefault()))
            .FirstOrDefaultAsync(ct)!;

    public Task<AuthenticatedUser?> GetByAccountNameAsync(string accountName, CancellationToken ct)
    {
        var name = (accountName ?? "").Trim();

        return db.Users2s.AsNoTracking()
            .Where(x => x.AccountName == name)
            .Join(db.Users.Where(u => u.Status == 1), x => x.UserId, u => u.Id, (x, u) => new { x, u })
            .Select(r => new AuthenticatedUser(
                r.u.Id,
                r.u.PersonId,
                r.u.Login ?? "",
                r.u.Person == null ? "" : (r.u.Person.Fio ?? ""),
                r.x.IsAdmin))
            .FirstOrDefaultAsync(ct)!;
    }

    /// <summary>Журнал неудачных попыток не должен мешать самому входу.</summary>
    public async Task RegisterFailedAttemptAsync(string login, CancellationToken ct)
    {
        try
        {
            db.FailedLogonAttempts.Add(new FailedLogonAttempt
            {
                Login = (login ?? "").Trim(),
                FailedLogonDate = DateTime.Now,
            });
            await db.SaveChangesAsync(ct);
        }
        catch
        {
            // намеренно проглатываем
        }
    }

    public async Task<LinkAccountResult> LinkAccountAsync(
        string login, string accountName, CancellationToken ct)
    {
        login = (login ?? "").Trim();
        accountName = (accountName ?? "").Trim();

        var user = await db.Users.FirstOrDefaultAsync(u => u.Login == login && u.Status == 1, ct);
        if (user == null)
            return LinkAccountResult.LoginNotFound;

        var users2 = await db.Users2s.FirstOrDefaultAsync(x => x.UserId == user.Id, ct);
        if (users2 == null)
        {
            db.Users2s.Add(new Users2
            {
                UserId = user.Id,
                AccountName = accountName,
                IsAdmin = false,
            });
        }
        else
        {
            // Логин уже привязан к другой доменной учётке — в BpDazApp это «Логин занят!».
            if (!string.IsNullOrEmpty(users2.AccountName) && users2.AccountName != accountName)
                return LinkAccountResult.LoginAlreadyLinked;

            users2.AccountName = accountName;
        }

        await db.SaveChangesAsync(ct);
        return LinkAccountResult.Ok;
    }

    public async Task<bool> SetPasswordAsync(int userId, string password, CancellationToken ct)
    {
        var users2 = await db.Users2s.FirstOrDefaultAsync(x => x.UserId == userId, ct);
        if (users2 == null)
            return false;

        users2.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        users2.PasswordUpdatedDate = DateTime.Now;

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user != null)
            user.LastPasswordUpdate = DateTime.Now;

        await db.SaveChangesAsync(ct);
        return true;
    }
}
