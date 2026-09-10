using BpDaz.Api.Dto;

namespace BpDaz.Api.Services.Users;

public interface IUserService
{
    Task<PagedResult<UserListItem>> GetListAsync(
        string? search, int page, int pageSize, CancellationToken ct);

    Task<UserEditItem?> GetForEditAsync(int id, CancellationToken ct);

    Task<SaveResult> UpdateAsync(int id, UserEditForm form, CancellationToken ct);
}
