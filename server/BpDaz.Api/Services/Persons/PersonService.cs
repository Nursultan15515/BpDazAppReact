using BpDaz.Api.Data;
using BpDaz.Api.Data.Entities;
using BpDaz.Api.Dto;
using Microsoft.EntityFrameworkCore;

namespace BpDaz.Api.Services.Persons;

public class PersonService(VcEntities db) : IPersonService
{
    /// <summary>Роль обычного пользователя бюро пропусков — как в BpDazApp.</summary>
    private const int DefaultRoleId = 4;

    public async Task<IReadOnlyList<PersonListItem>> GetListAsync(string? search, CancellationToken ct)
    {
        var query = (search ?? "").Trim();

        var persons = db.Persons.AsNoTracking().Where(p => p.Status == 1);

        if (query != "")
        {
            persons = persons.Where(p =>
                (p.Fio ?? "").Contains(query)
                || (p.Department.Fullname ?? p.Department.Title).Contains(query)
                || (p.Position != null && p.Position.Title.Contains(query)));
        }

        // Сортировка до проекции — иначе EF попытается перевести ORDER BY по DTO.
        return await persons
            .OrderBy(p => p.Fio)
            .Select(p => new PersonListItem(
                p.Id,
                p.Fio ?? "",
                p.Lastname,
                p.Firstname,
                p.MiddleName,
                p.Department.Fullname ?? p.Department.Title,
                p.Position == null ? "" : p.Position.Title,
                p.PlaceNavigation == null ? "" : (p.PlaceNavigation.Name ?? p.PlaceNavigation.Title),
                p.Place,
                p.PhoneInternal,
                p.Phone,
                p.Email,
                db.Users.Where(u => u.PersonId == p.Id).Select(u => u.Login).FirstOrDefault()))
            .ToListAsync(ct);
    }

    public async Task<SaveResult> CreateAsync(CreatePersonForm form, CancellationToken ct)
    {
        var login = (form.Login ?? "").Trim();
        var accountName = (form.AccountName ?? "").Trim();

        if (form.IsUserOfSystem)
        {
            if (await db.Users.AnyAsync(u => u.Login == login, ct))
                return SaveResult.LoginTaken;

            if (await db.Users2s.AnyAsync(u => u.AccountName == accountName, ct))
                return SaveResult.AccountTaken;
        }

        // FIO — вычисляемое поле в БД, не заполняем.
        var person = new Person
        {
            Lastname = form.Lastname.Trim(),
            Firstname = form.Firstname.Trim(),
            MiddleName = form.MiddleName?.Trim(),
            PositionId = form.PositionId,
            DepartmentId = form.DepartmentId,
            PlaceId = form.PlaceId,
            Place = form.Place?.Trim(),
            Email = form.Email?.Trim(),
            PhoneInternal = form.PhoneInternal?.Trim(),
            Phone = form.Phone?.Trim(),
            Status = 1,
            NotificationType = 1,
            CreateDate = DateTime.Now,
            IsSystemPerson = false,
            NoSync = false,
            IsDirector = false,
            StartDate = DateTime.Now,
        };

        db.Persons.Add(person);
        await db.SaveChangesAsync(ct);

        if (!form.IsUserOfSystem)
            return SaveResult.Ok;

        var user = new User
        {
            Login = login,
            PersonId = person.Id,
            Status = 1,
            LastPasswordUpdate = DateTime.Now,
            EnterAfterExpires = 0,
            UserType = 0,
            IsVcallowed = true,
            IsSdallowed = false,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(ct);

        db.Users2s.Add(new Users2
        {
            UserId = user.Id,
            AccountName = accountName,
            IsAdmin = false,
        });

        db.UserRoles.Add(new UserRole
        {
            UserId = user.Id,
            RoleId = DefaultRoleId,
        });

        await db.SaveChangesAsync(ct);

        return SaveResult.Ok;
    }
}
