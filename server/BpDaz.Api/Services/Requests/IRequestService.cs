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

    /// <summary>Вся отфильтрованная выборка без пагинации — для выгрузки в Excel.</summary>
    Task<IReadOnlyList<RequestListItem>> GetAllAsync(
        RequestFilterMode mode,
        DateOnly? dateFrom,
        DateOnly? dateTo,
        bool onlyMine,
        string? search,
        CancellationToken ct);

    Task<RequestDetails?> GetByIdAsync(int id, CancellationToken ct);

    /// <summary>Фото посетителя по заявке. Null — снимка нет.</summary>
    Task<VisitorPhoto?> GetPhotoAsync(int requestId, CancellationToken ct);

    /// <summary>
    /// Создаёт заявку. Если посетитель в чёрном списке, заявка не создаётся
    /// и возвращается результат с VisitorBlacklisted = true.
    /// </summary>
    Task<CreateRequestResult> CreateAsync(CreateRequestForm form, CancellationToken ct);

    /// <summary>Мягкое удаление пропуска. Разрешено только до прихода посетителя.</summary>
    Task<DeleteRequestResult> DeleteAsync(int id, CancellationToken ct);
}
