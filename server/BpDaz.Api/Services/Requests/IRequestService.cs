using BpDaz.Api.Dto;

namespace BpDaz.Api.Services.Requests;

public interface IRequestService
{
    Task<PagedResult<RequestListItem>> GetListAsync(
        RequestFilterMode mode,
        DateOnly? dateFrom,
        DateOnly? dateTo,
        bool onlyMine,
        string? search,
        int page,
        int pageSize,
        CancellationToken ct);

    Task<RequestDetails?> GetByIdAsync(int id, CancellationToken ct);

    /// <summary>Фото посетителя по заявке. Null — снимка нет.</summary>
    Task<VisitorPhoto?> GetPhotoAsync(int requestId, CancellationToken ct);

    /// <summary>
    /// Создаёт заявку. Если посетитель в чёрном списке, заявка не создаётся
    /// и возвращается результат с VisitorBlacklisted = true.
    /// </summary>
    Task<CreateRequestResult> CreateAsync(CreateRequestForm form, CancellationToken ct);

    Task<bool> DeleteAsync(int id, CancellationToken ct);
}
