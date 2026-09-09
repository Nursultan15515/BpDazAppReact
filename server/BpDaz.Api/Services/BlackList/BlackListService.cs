using BpDaz.Api.Data;
using BpDaz.Api.Data.Entities;
using BpDaz.Api.Dto;
using BpDaz.Api.Infrastructure.CurrentUser;
using Microsoft.EntityFrameworkCore;

namespace BpDaz.Api.Services.BlackList;

public class BlackListService(VcEntities db, ICurrentUser currentUser) : IBlackListService
{
    public async Task<IReadOnlyList<BlackListItem>> GetListAsync(string? search, CancellationToken ct)
    {
        var query = (search ?? "").Trim();

        var entries = db.BlackListVisitors.AsNoTracking().Where(b => b.DeletedDate == null);

        if (query != "")
        {
            entries = entries.Where(b =>
                (b.Iin ?? "").Contains(query)
                || (b.LastName ?? "").Contains(query)
                || (b.FirstName ?? "").Contains(query));
        }

        // Фильтр и сортировка идут по сущности, проекция — последней: ORDER BY
        // поверх готового DTO EF Core перевести не может.
        // Внешнего ключа BlackListVisitors → Users нет, поэтому автор берётся подзапросом.
        return await entries
            .OrderByDescending(b => b.Id)
            .Select(b => new BlackListItem(
                b.Id,
                b.Iin,
                b.LastName,
                b.FirstName,
                b.MiddleName,
                b.CreatedDate,
                db.Users.Where(u => u.Id == b.UserId)
                    .Select(u => u.Person == null ? u.Login : (u.Person.Fio ?? u.Login))
                    .FirstOrDefault() ?? ""))
            .ToListAsync(ct);
    }

    public async Task<BlackListItem> AddAsync(AddBlackListForm form, CancellationToken ct)
    {
        var entry = new BlackListVisitor
        {
            Iin = form.Iin,
            LastName = form.Lastname.Trim(),
            FirstName = form.Firstname.Trim(),
            MiddleName = form.MiddleName?.Trim(),
            CreatedDate = DateTime.Now,
            UserId = currentUser.UserId,
        };

        db.BlackListVisitors.Add(entry);
        await db.SaveChangesAsync(ct);

        var author = await db.Users.AsNoTracking()
            .Where(u => u.Id == entry.UserId)
            .Select(u => u.Person == null ? u.Login : (u.Person.Fio ?? u.Login))
            .FirstOrDefaultAsync(ct);

        return new BlackListItem(
            entry.Id, entry.Iin, entry.LastName, entry.FirstName, entry.MiddleName,
            entry.CreatedDate, author ?? "");
    }

    /// <summary>Удаление мягкое — проставляем DeletedDate, как в BpDazApp.</summary>
    public async Task<bool> DeleteAsync(int id, CancellationToken ct)
    {
        var entry = await db.BlackListVisitors
            .FirstOrDefaultAsync(b => b.Id == id && b.DeletedDate == null, ct);

        if (entry == null)
            return false;

        entry.DeletedDate = DateTime.Now;
        await db.SaveChangesAsync(ct);
        return true;
    }

    public Task<bool> IsBlacklistedAsync(string iin, CancellationToken ct) =>
        db.BlackListVisitors.AsNoTracking()
            .AnyAsync(b => b.DeletedDate == null && b.Iin == iin, ct);
}
