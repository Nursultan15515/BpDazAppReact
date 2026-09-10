using BpDaz.Api.Data;
using BpDaz.Api.Data.Entities;
using BpDaz.Api.Dto;
using Microsoft.EntityFrameworkCore;

namespace BpDaz.Api.Services.Users;

public class UserService(VcEntities db) : IUserService
{
    public async Task<PagedResult<UserListItem>> GetListAsync(
        string? search, int page, int pageSize, CancellationToken ct)
    {
        var (currentPage, size) = Paging.Normalize(page, pageSize);
        var query = (search ?? "").Trim();

        var users = db.Users.AsNoTracking().AsQueryable();

        if (query != "")
        {
            users = users.Where(u =>
                (u.Person != null && (u.Person.Fio ?? "").Contains(query))
                || (u.Login ?? "").Contains(query)
                || db.Users2s.Any(x => x.UserId == u.Id && x.AccountName.Contains(query)));
        }

        var totalCount = await users.CountAsync(ct);

        // Фильтр, сортировка и срез — по сущности, проекция последней: ORDER BY поверх
        // готового DTO EF Core не переводит.
        // У Users2 нет внешнего ключа на Users, поэтому её поля берём подзапросом.
        var items = await users
            .OrderBy(u => u.Person == null ? u.Login : u.Person.Fio)
            .ThenBy(u => u.Login)
            .Skip((currentPage - 1) * size)
            .Take(size)
            .Select(u => new UserListItem(
                u.Id,
                u.PersonId,
                u.Person == null ? "" : (u.Person.Fio ?? ""),
                u.Login,
                db.Users2s.Where(x => x.UserId == u.Id).Select(x => x.AccountName).FirstOrDefault(),
                u.Person == null ? "" : (u.Person.Department.Fullname ?? u.Person.Department.Title),
                u.Person == null ? null : u.Person.Place,
                u.Person == null ? null : u.Person.Phone,
                db.Users2s.Where(x => x.UserId == u.Id).Select(x => x.IsAdmin).FirstOrDefault()))
            .ToListAsync(ct);

        return new PagedResult<UserListItem>(items, totalCount, currentPage, size);
    }

    public async Task<UserEditItem?> GetForEditAsync(int id, CancellationToken ct) =>
        await db.Users.AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new UserEditItem(
                u.Id,
                u.Person == null ? null : u.Person.Lastname,
                u.Person == null ? null : u.Person.Firstname,
                u.Person == null ? null : u.Person.MiddleName,
                u.Login,
                db.Users2s.Where(x => x.UserId == u.Id).Select(x => x.AccountName).FirstOrDefault(),
                db.Users2s.Where(x => x.UserId == u.Id).Select(x => x.IsAdmin).FirstOrDefault()))
            .FirstOrDefaultAsync(ct);

    public async Task<SaveResult> UpdateAsync(int id, UserEditForm form, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user == null)
            return SaveResult.NotFound;

        var login = form.Login.Trim();
        var accountName = form.AccountName.Trim();

        if (await db.Users.AnyAsync(u => u.Login == login && u.Id != user.Id, ct))
            return SaveResult.LoginTaken;

        if (await db.Users2s.AnyAsync(u => u.AccountName == accountName && u.UserId != user.Id, ct))
            return SaveResult.AccountTaken;

        if (user.PersonId.HasValue)
        {
            var person = await db.Persons.FirstOrDefaultAsync(p => p.Id == user.PersonId.Value, ct);
            if (person != null)
            {
                person.Lastname = form.Lastname?.Trim();
                person.Firstname = form.Firstname?.Trim();
                person.MiddleName = form.MiddleName?.Trim();
                // FIO не трогаем — вычисляемое поле, SQL пересчитает его сам.
            }
        }

        user.Login = login;
        user.LastEditDate = DateTime.Now;

        var users2 = await db.Users2s.FirstOrDefaultAsync(u => u.UserId == user.Id, ct);
        if (users2 == null)
        {
            db.Users2s.Add(new Users2
            {
                UserId = user.Id,
                AccountName = accountName,
                IsAdmin = form.IsAdmin,
            });
        }
        else
        {
            users2.AccountName = accountName;
            users2.IsAdmin = form.IsAdmin;
        }

        await db.SaveChangesAsync(ct);
        return SaveResult.Ok;
    }
}
