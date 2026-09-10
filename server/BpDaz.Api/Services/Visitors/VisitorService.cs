using BpDaz.Api.Data;
using BpDaz.Api.Data.Entities;
using BpDaz.Api.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BpDaz.Api.Services.Visitors;

public class VisitorService(
    HttpClient http,
    VcEntities db,
    IOptions<GbdflOptions> options,
    ILogger<VisitorService> logger) : IVisitorService
{
    private readonly GbdflOptions _options = options.Value;

    public async Task<VisitorLookupResult?> FindByIinAsync(string iin, CancellationToken ct)
    {
        iin = (iin ?? "").Trim();

        if (_options.IsConfigured)
        {
            var fromGbdfl = await TryFindInGbdflAsync(iin, ct);
            if (fromGbdfl != null)
                return fromGbdfl;
        }

        // Интеграция выключена или не ответила — показываем то, что уже есть у нас.
        return await FindLocalAsync(iin, ct);
    }

    private async Task<VisitorLookupResult?> TryFindInGbdflAsync(string iin, CancellationToken ct)
    {
        GbdflResponse? model;

        try
        {
            var url = $"{_options.BaseUrl}?iin={Uri.EscapeDataString(iin)}&key={Uri.EscapeDataString(_options.Key)}";

            using var response = await http.GetAsync(url, ct);
            response.EnsureSuccessStatusCode();

            model = await response.Content.ReadFromJsonAsync<GbdflResponse>(ct);
        }
        catch (Exception ex)
        {
            // Недоступность внешнего сервиса не должна ломать форму заявки.
            logger.LogWarning(ex, "ГБДФЛ недоступен, поиск по ИИН выполнен по локальной базе.");
            return null;
        }

        if (model is not { response_result: true })
            return null;

        var visitor = await UpsertVisitorAsync(model, ct);

        return new VisitorLookupResult(
            VisitorLookupSource.Gbdfl,
            visitor.Id,
            visitor.Iin ?? iin,
            visitor.LastName,
            visitor.Firstname,
            visitor.MiddleName,
            visitor.Firm,
            visitor.MobilePhone);
    }

    /// <summary>Данные из ГБДФЛ сохраняются в Visitors — так же делал FindByIIN в BpDazApp.</summary>
    private async Task<Visitor> UpsertVisitorAsync(GbdflResponse model, CancellationToken ct)
    {
        var visitor = await db.Visitors.FirstOrDefaultAsync(v => v.Iin == model.iin && v.Status == 1, ct);

        if (visitor == null)
        {
            visitor = new Visitor
            {
                Iin = model.iin,
                LastName = model.surname,
                Firstname = model.firstname,
                MiddleName = model.secondname,
                Birthdate = model.birth_date,
                HasMiddlename = !string.IsNullOrEmpty(model.secondname),
                IsAutoGuest = 0,
                IsAlien = 0,
                CreateDate = DateTime.Now,
                Status = 1,
                TypeId = 0,
            };
            db.Visitors.Add(visitor);
        }
        else
        {
            visitor.LastName = model.surname;
            visitor.Firstname = model.firstname;
            visitor.MiddleName = model.secondname;
            visitor.Birthdate = model.birth_date;
            visitor.HasMiddlename = !string.IsNullOrEmpty(model.secondname);
        }

        await db.SaveChangesAsync(ct);
        return visitor;
    }

    private Task<VisitorLookupResult?> FindLocalAsync(string iin, CancellationToken ct) =>
        db.Visitors.AsNoTracking()
            .Where(v => v.Iin == iin && v.Status == 1)
            .Select(v => new VisitorLookupResult(
                VisitorLookupSource.Local,
                v.Id,
                v.Iin ?? "",
                v.LastName,
                v.Firstname,
                v.MiddleName,
                v.Firm,
                v.MobilePhone))
            .FirstOrDefaultAsync(ct)!;
}
