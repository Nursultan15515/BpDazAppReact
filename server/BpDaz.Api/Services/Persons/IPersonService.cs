using BpDaz.Api.Dto;

namespace BpDaz.Api.Services.Persons;

public interface IPersonService
{
    Task<IReadOnlyList<PersonListItem>> GetListAsync(string? search, CancellationToken ct);

    Task<SaveResult> CreateAsync(CreatePersonForm form, CancellationToken ct);
}
