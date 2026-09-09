using BpDaz.Api.Dto;

namespace BpDaz.Api.Services.BlackList;

public interface IBlackListService
{
    Task<IReadOnlyList<BlackListItem>> GetListAsync(string? search, CancellationToken ct);

    Task<BlackListItem> AddAsync(AddBlackListForm form, CancellationToken ct);

    Task<bool> DeleteAsync(int id, CancellationToken ct);

    /// <summary>Числится ли ИИН в действующем чёрном списке.</summary>
    Task<bool> IsBlacklistedAsync(string iin, CancellationToken ct);
}
