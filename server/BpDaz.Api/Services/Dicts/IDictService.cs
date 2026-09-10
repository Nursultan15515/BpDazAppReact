using BpDaz.Api.Dto;

namespace BpDaz.Api.Services.Dicts;

public interface IDictService
{
    Task<IReadOnlyList<PersonOption>> SearchPersonsAsync(string? search, CancellationToken ct);

    /// <summary>
    /// Карточка текущего пользователя — ею форма заявки заполняет принимающего
    /// по умолчанию, как ViewBag.DefaultHostPerson в BpDazApp.
    /// </summary>
    Task<PersonOption?> GetCurrentPersonAsync(CancellationToken ct);

    Task<IReadOnlyList<BuildingOption>> GetBuildingsAsync(CancellationToken ct);

    Task<IReadOnlyList<DepartmentOption>> GetDepartmentsAsync(CancellationToken ct);

    Task<IReadOnlyList<PositionOption>> GetPositionsAsync(CancellationToken ct);

    Task<IReadOnlyList<string>> SearchOrganizationsAsync(string? search, CancellationToken ct);
}
