using BpDaz.Api.Dto;

namespace BpDaz.Api.Services.Users;

public interface IUserService
{
    Task<IReadOnlyList<UserListItem>> GetListAsync(string? search, CancellationToken ct);

    Task<UserEditItem?> GetForEditAsync(int id, CancellationToken ct);

    Task<SaveResult> UpdateAsync(int id, UserEditForm form, CancellationToken ct);
}
