using BpDaz.Api.Dto;

namespace BpDaz.Api.Services.Persons;

public interface IPersonService
{
    Task<PagedResult<PersonListItem>> GetListAsync(
        string? search, int page, int pageSize, CancellationToken ct);

    Task<SaveResult> CreateAsync(CreatePersonForm form, CancellationToken ct);
}
