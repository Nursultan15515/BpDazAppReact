using BpDaz.Api.Data;
using BpDaz.Api.Data.Entities;
using BpDaz.Api.Dto;
using BpDaz.Api.Infrastructure.CurrentUser;
using BpDaz.Api.Services.BlackList;
using Microsoft.EntityFrameworkCore;

namespace BpDaz.Api.Services.Requests;

public class RequestService(VcEntities db, ICurrentUser currentUser, IBlackListService blackList)
    : IRequestService
{
    /// <summary>Список без явного периода показывает три последних дня — как в BpDazApp.</summary>
    private const int DefaultPeriodDays = 3;

    /// <summary>
    /// Плоская проекция заявки со всем, что нужно и списку, и карточке.
    /// Держим её одну, чтобы правила расчёта статуса не разъезжались между экранами.
    /// </summary>
    private sealed record RequestRow
    {
        public required Request Request { get; init; }
        public Visitor? Visitor { get; init; }
        public Person? HostPerson { get; init; }
        public Person? Maker { get; init; }
        public string? HostDepartment { get; init; }
        public string? Building { get; init; }
        public DateTime? EnterTime { get; init; }
        public DateTime? ExitTime { get; init; }
        public bool HasVisit { get; init; }
        public string? CardNumber { get; init; }
        public string? PhotoId { get; init; }
    }

    public async Task<PagedResult<RequestListItem>> GetListAsync(
        RequestFilterMode mode,
        DateOnly? dateFrom,
        DateOnly? dateTo,
        bool onlyMine,
        string? search,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        var (currentPage, size) = Paging.Normalize(page, pageSize);

        var query = FilteredQuery(mode, dateFrom, dateTo, onlyMine, search);

        // Счёт по отфильтрованной выборке — до среза страницы.
        var totalCount = await query.CountAsync(ct);

        var rows = await query
            .OrderByDescending(r => r.Request.Id)
            .Skip((currentPage - 1) * size)
            .Take(size)
            .ToListAsync(ct);

        return new PagedResult<RequestListItem>(
            [.. rows.Select(ToListItem)], totalCount, currentPage, size);
    }

    public async Task<IReadOnlyList<RequestListItem>> GetAllAsync(
        RequestFilterMode mode,
        DateOnly? dateFrom,
        DateOnly? dateTo,
        bool onlyMine,
        string? search,
        CancellationToken ct)
    {
        // Без Skip/Take: выгрузка берёт всю отфильтрованную выборку, а не страницу —
        // как AllPages(true) у Kendo-грида в BpDazApp.
        var rows = await FilteredQuery(mode, dateFrom, dateTo, onlyMine, search)
            .OrderByDescending(r => r.Request.Id)
            .ToListAsync(ct);

        return [.. rows.Select(ToListItem)];
    }

    /// <summary>
    /// Общий фильтр списка и выгрузки. Держим его одним методом, чтобы в Excel
    /// не уехало не то, что видно на экране.
    /// </summary>
    private IQueryable<RequestRow> FilteredQuery(
        RequestFilterMode mode,
        DateOnly? dateFrom,
        DateOnly? dateTo,
        bool onlyMine,
        string? search)
    {
        var from = dateFrom?.ToDateTime(TimeOnly.MinValue)
            ?? DateTime.Today.AddDays(-DefaultPeriodDays);
        var to = dateTo?.ToDateTime(new TimeOnly(23, 59, 59))
            ?? DateTime.Today.AddDays(1).AddSeconds(-1);

        var query = BaseQuery()
            .Where(r => from <= r.Request.DateFrom && r.Request.DateFrom <= to);

        if (onlyMine)
            query = query.Where(r => r.Request.MakerId == currentUser.PersonId);

        query = mode switch
        {
            RequestFilterMode.InBuilding => query.Where(r => r.EnterTime != null && r.ExitTime == null),
            RequestFilterMode.Left => query.Where(r => r.ExitTime != null),
            _ => query,
        };

        // Поиск ищет по всей выборке, а не по видимой странице, поэтому он на сервере.
        var text = (search ?? "").Trim();
        if (text != "")
        {
            query = query.Where(r =>
                (r.Visitor != null && r.Visitor.Fio.Contains(text))
                || (r.Visitor != null && (r.Visitor.Iin ?? "").Contains(text))
                || (r.HostDepartment ?? "").Contains(text)
                || (r.HostPerson != null && (r.HostPerson.Fio ?? "").Contains(text))
                || (r.Maker != null && (r.Maker.Fio ?? "").Contains(text)));
        }

        return query;
    }

    public async Task<RequestDetails?> GetByIdAsync(int id, CancellationToken ct)
    {
        var row = await BaseQuery().FirstOrDefaultAsync(r => r.Request.Id == id, ct);

        return row == null ? null : ToDetails(row);
    }

    /// <summary>
    /// Фото посетителя по заявке. Повторяет GetVisitorPhoto из BpDazApp, но
    /// отсутствие снимка отдаёт как null, а не картинкой-заглушкой: иначе браузер
    /// закеширует пустышку и её не отличить от настоящего фото.
    /// </summary>
    public async Task<VisitorPhoto?> GetPhotoAsync(int requestId, CancellationToken ct)
    {
        var photoId = await db.Visits.AsNoTracking()
            .Where(v => v.RequestId == requestId && v.DocumentFilesId != null)
            .OrderByDescending(v => v.Id)
            .Select(v => v.DocumentFilesId)
            .FirstOrDefaultAsync(ct);

        if (string.IsNullOrWhiteSpace(photoId))
            return null;

        var file = await db.DocumentFiles.AsNoTracking()
            .Where(f => f.Id == photoId)
            .Select(f => new { f.Blob, f.ContentType, f.StoredInTable, f.FileLocation })
            .FirstOrDefaultAsync(ct);

        // Файл может лежать на диске (FileLocation вида «aspdoc:…») — такие записи
        // мы прочитать не можем, поэтому честно отвечаем «фото нет».
        if (file?.Blob == null || file.Blob.Length == 0)
            return null;

        return new VisitorPhoto(
            file.Blob,
            string.IsNullOrEmpty(file.ContentType) ? "image/jpeg" : file.ContentType);
    }

    public async Task<CreateRequestResult> CreateAsync(CreateRequestForm form, CancellationToken ct)
    {
        // Проверка чёрного списка идёт до всех записей — как в PostRequest у BpDazApp.
        if (await blackList.IsBlacklistedAsync(form.Iin, ct))
            return new CreateRequestResult(null, VisitorBlacklisted: true);

        var from = form.Date.ToDateTime(form.TimeFrom);
        var to = form.Date.ToDateTime(form.TimeTo);

        // Часы «с» и «по» приходят с формы независимо; в BpDazApp такой заявке
        // принудительно давали час — сохраняем поведение вместо отказа.
        if (from >= to)
            to = from.AddHours(1);

        var visitor = await AddOrUpdateVisitorAsync(form, ct);

        var hostPerson = await db.Persons.FirstOrDefaultAsync(p => p.Id == form.HostPersonId, ct)
            ?? throw new InvalidOperationException($"Сотрудник {form.HostPersonId} не найден.");

        // Кабинет возвращается в карточку сотрудника — строка hostPerson.Place = data.Place
        // из PostRequest у BpDazApp. Так поправленный однажды кабинет подставляется
        // во все следующие заявки к этому человеку.
        var place = form.Place?.Trim();
        if (!string.IsNullOrEmpty(place) && hostPerson.Place != place)
            hostPerson.Place = place;

        var hostCompanyId = await db.Departments
            .Where(d => d.Id == hostPerson.DepartmentId)
            .Select(d => (int?)d.CompanyId)
            .FirstOrDefaultAsync(ct);

        var request = new Request
        {
            Date = DateTime.Now,
            DateFrom = from,
            DateTo = to,
            NumOfVisits = 1,
            HostPersonId = form.HostPersonId,
            MakerId = currentUser.PersonId,
            SignerId = currentUser.PersonId,
            HostDepartmentId = hostPerson.DepartmentId,
            InitDepartmentId = hostPerson.DepartmentId,
            HostCompanyId = hostCompanyId,
            VisitorId = visitor.Id,
            VisitsToEnd = 1,
            PlaceId = form.PlaceId,
            // BpDazApp сюда кабинет не писал вовсе, из-за чего колонка «Кабинет»
            // в списке всегда пустовала. Пишем — чтобы в заявке остался тот кабинет,
            // который был указан на момент визита, даже если сотрудник переедет.
            Place = place,
            Objective = form.Purpose,
            SignDate = DateTime.Now,
            Decision = 1,
            StayCar = false,
            MoveDirection = 0,
            IsRegistration = false,
            RequestType = 1,
            HostPhone = form.HostPhone,
            LastUpdateDate = DateTime.Now,
        };

        db.Requests.Add(request);
        await db.SaveChangesAsync(ct);

        var details = await GetByIdAsync(request.Id, ct)
            ?? throw new InvalidOperationException("Заявка создана, но не читается.");

        return new CreateRequestResult(details, VisitorBlacklisted: false);
    }

    /// <summary>
    /// Удалять можно только пропуск, по которому посетитель ещё не пришёл:
    /// в BpDazApp кнопка «Удалить пропуск» рисовалась лишь при статусах
    /// «Оформлен» и «Просрочен». Там проверка жила только во вьюхе — здесь она
    /// на сервере, потому что DELETE доступен и напрямую.
    /// </summary>
    public static bool CanDelete(RequestStatus status) =>
        status is RequestStatus.Decorated or RequestStatus.Overdue;

    public async Task<DeleteRequestResult> DeleteAsync(int id, CancellationToken ct)
    {
        var row = await BaseQuery().FirstOrDefaultAsync(r => r.Request.Id == id, ct);
        if (row == null)
            return DeleteRequestResult.NotFound;

        if (!CanDelete(GetStatus(row)))
            return DeleteRequestResult.StatusForbids;

        // Строку заявки не трогаем — удаление мягкое, через журнал RequestDeleteInfo.
        db.RequestDeleteInfos.Add(new RequestDeleteInfo
        {
            RequestId = id,
            VisitorId = row.Request.VisitorId,
            UserId = currentUser.UserId,
            CreatedDate = DateTime.Now,
        });

        await db.SaveChangesAsync(ct);
        return DeleteRequestResult.Ok;
    }

    private IQueryable<RequestRow> BaseQuery() =>
        from request in db.Requests.AsNoTracking()
        where !db.RequestDeleteInfos.Any(d => d.RequestId == request.Id)
        join visitorRow in db.Visitors on request.VisitorId equals visitorRow.Id into visitorJoin
        from visitor in visitorJoin.DefaultIfEmpty()
        join hostRow in db.Persons on request.HostPersonId equals hostRow.Id into hostJoin
        from hostPerson in hostJoin.DefaultIfEmpty()
        join makerRow in db.Persons on request.MakerId equals makerRow.Id into makerJoin
        from maker in makerJoin.DefaultIfEmpty()
        join departmentRow in db.Departments on request.HostDepartmentId equals departmentRow.Id into departmentJoin
        from department in departmentJoin.DefaultIfEmpty()
        join placeRow in db.Places on request.PlaceId equals placeRow.Id into placeJoin
        from place in placeJoin.DefaultIfEmpty()
        select new RequestRow
        {
            Request = request,
            Visitor = visitor,
            HostPerson = hostPerson,
            Maker = maker,
            HostDepartment = department.Fullname ?? department.Title,
            Building = place.Name ?? place.Title,
            // Визит на заявку может быть не один — берём последний по времени создания.
            EnterTime = db.Visits.Where(v => v.RequestId == request.Id)
                .OrderByDescending(v => v.Id).Select(v => v.VisitorDateIn).FirstOrDefault(),
            ExitTime = db.Visits.Where(v => v.RequestId == request.Id)
                .OrderByDescending(v => v.Id).Select(v => v.DateExit).FirstOrDefault(),
            HasVisit = db.Visits.Any(v => v.RequestId == request.Id),
            CardNumber = db.Visits.Where(v => v.RequestId == request.Id)
                .OrderByDescending(v => v.Id).Select(v => v.CardReadableNum).FirstOrDefault(),
            // Снимок делают на посту при выдаче карты, поэтому он висит на визите,
            // а не на посетителе — как PhotoID в RequestInfo у BpDazApp.
            PhotoId = db.Visits.Where(v => v.RequestId == request.Id)
                .OrderByDescending(v => v.Id).Select(v => v.DocumentFilesId).FirstOrDefault(),
        };

    private async Task<Visitor> AddOrUpdateVisitorAsync(CreateRequestForm form, CancellationToken ct)
    {
        var visitor = await db.Visitors.FirstOrDefaultAsync(v => v.Iin == form.Iin && v.Status == 1, ct);

        if (visitor == null)
        {
            // FIO — вычисляемое поле в БД, не заполняем.
            visitor = new Visitor
            {
                Iin = form.Iin,
                LastName = form.Lastname,
                Firstname = form.Firstname,
                MiddleName = form.MiddleName,
                MobilePhone = form.MobilePhone,
                Firm = form.Organization,
                HasMiddlename = !string.IsNullOrEmpty(form.MiddleName),
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
            visitor.LastName = form.Lastname;
            visitor.Firstname = form.Firstname;
            visitor.MiddleName = form.MiddleName;
            visitor.MobilePhone = form.MobilePhone;
            visitor.Firm = form.Organization;
            visitor.HasMiddlename = !string.IsNullOrEmpty(form.MiddleName);
        }

        await db.SaveChangesAsync(ct);
        return visitor;
    }

    // Persons.FIO и Visitors.FIO — вычисляемые поля БД в формате «Фамилия И.О.»,
    // сокращать их повторно не нужно.
    private static RequestListItem ToListItem(RequestRow row) => new(
        row.Request.Id,
        row.Visitor?.Fio ?? "",
        row.Visitor?.Iin ?? "",
        row.Building ?? "",
        row.Request.Place ?? "",
        $"{row.Request.DateFrom:dd.MM.yyyy HH:mm} - {row.Request.DateTo:HH:mm}",
        FormatEnterExit(row),
        row.EnterTime,
        row.ExitTime,
        row.HostDepartment ?? "",
        row.HostPerson?.Fio ?? "",
        row.Maker?.Fio ?? "",
        GetStatus(row));

    private static RequestDetails ToDetails(RequestRow row) => new(
        row.Request.Id,
        row.Request.Date,
        row.Visitor?.Iin ?? "",
        row.Visitor?.LastName ?? "",
        row.Visitor?.Firstname ?? "",
        row.Visitor?.MiddleName,
        row.Visitor?.Firm,
        row.Visitor?.MobilePhone,
        row.Request.DateFrom.ToString("yyyy-MM-dd"),
        row.Request.DateFrom.ToString("HH:mm"),
        row.Request.DateTo.ToString("HH:mm"),
        row.Request.Objective,
        FullName(row.HostPerson),
        row.Request.HostPhone ?? row.HostPerson?.PhoneInternal,
        row.Building ?? "",
        row.Request.Place ?? row.HostPerson?.Place ?? "",
        row.CardNumber,
        GetStatus(row),
        // nchar(32) читается добитым пробелами — обрезаем, иначе ссылка не сойдётся.
        row.PhotoId?.TrimEnd(),
        CanDelete(GetStatus(row)));

    private static string FullName(Person? person) => person == null
        ? ""
        : string.Join(' ', new[] { person.Lastname, person.Firstname, person.MiddleName }
            .Where(part => !string.IsNullOrWhiteSpace(part)));

    private static string FormatEnterExit(RequestRow row)
    {
        if (row.EnterTime == null && row.ExitTime == null)
            return "";

        var enter = row.EnterTime?.ToString("dd.MM.yyyy HH:mm") ?? "";
        var exit = row.ExitTime?.ToString("HH:mm") ?? "";

        return $"{enter} - {exit}";
    }

    /// <summary>Повторяет RepRequest.GetRequestState из BpDazApp.</summary>
    private static RequestStatus GetStatus(RequestRow row)
    {
        var visitsToEnd = row.Request.VisitsToEnd;

        if (visitsToEnd == 0 && row.ExitTime != null)
            return RequestStatus.Done;

        if (visitsToEnd == 1 && row.Request.DateTo < DateTime.Now)
            return RequestStatus.Overdue;

        if (visitsToEnd == 0 && row.EnterTime != null && row.ExitTime == null)
            return RequestStatus.Current;

        if (visitsToEnd == 1 && !row.HasVisit)
            return RequestStatus.Decorated;

        if (row.HasVisit && row.EnterTime == null && row.ExitTime == null)
            return RequestStatus.CardTaken;

        return RequestStatus.Default;
    }
}
