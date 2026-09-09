using BpDaz.Api.Data;
using BpDaz.Api.Dto;
using Microsoft.EntityFrameworkCore;

namespace BpDaz.Api.Services.Dicts;

public class DictService(VcEntities db) : IDictService
{
    private const int MaxSuggestions = 20;

    public async Task<IReadOnlyList<PersonOption>> SearchPersonsAsync(string? search, CancellationToken ct)
    {
        var query = (search ?? "").Trim();

        var persons =
            from person in db.Persons.AsNoTracking().Where(p => p.Status == 1)
            where query == "" || (person.Fio != null && person.Fio.Contains(query))
            join positionRow in db.Positions on person.PositionId equals positionRow.Id into positionJoin
            from position in positionJoin.DefaultIfEmpty()
            join departmentRow in db.Departments on person.DepartmentId equals departmentRow.Id into departmentJoin
            from department in departmentJoin.DefaultIfEmpty()
            join placeRow in db.Places on person.PlaceId equals placeRow.Id into placeJoin
            from place in placeJoin.DefaultIfEmpty()
            orderby person.Fio
            select new PersonOption(
                person.Id,
                person.Fio ?? "",
                position.Title ?? "",
                department.Fullname ?? department.Title ?? "",
                place.Name ?? place.Title ?? "",
                person.PlaceId ?? 0,
                person.Place,
                person.PhoneInternal);

        return await persons.Take(MaxSuggestions).ToListAsync(ct);
    }

    /// <summary>Здание — площадка верхнего уровня; вложенные помещения сюда не попадают.</summary>
    public async Task<IReadOnlyList<BuildingOption>> GetBuildingsAsync(CancellationToken ct) =>
        await db.Places.AsNoTracking()
            .Where(p => p.ParentId == null)
            .OrderBy(p => p.Title)
            .Select(p => new BuildingOption(p.Id, p.Name ?? p.Title))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<DepartmentOption>> GetDepartmentsAsync(CancellationToken ct) =>
        await db.Departments.AsNoTracking()
            .Where(d => d.Status == 1)
            .OrderBy(d => d.Fullname ?? d.Title)
            .Select(d => new DepartmentOption(d.Id, d.Fullname ?? d.Title))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<PositionOption>> GetPositionsAsync(CancellationToken ct) =>
        await db.Positions.AsNoTracking()
            .Where(p => p.Status)
            .OrderBy(p => p.Title)
            .Select(p => new PositionOption(p.Id, p.Title))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<string>> SearchOrganizationsAsync(string? search, CancellationToken ct)
    {
        var query = (search ?? "").Trim();

        return await db.Visitors.AsNoTracking()
            .Where(v => v.Firm != null && v.Firm != "")
            .Where(v => query == "" || v.Firm!.Contains(query))
            .Select(v => v.Firm!)
            .Distinct()
            .OrderBy(firm => firm)
            .Take(MaxSuggestions)
            .ToListAsync(ct);
    }
}
