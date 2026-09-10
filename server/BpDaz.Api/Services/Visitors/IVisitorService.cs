using BpDaz.Api.Dto;

namespace BpDaz.Api.Services.Visitors;

public interface IVisitorService
{
    /// <summary>
    /// Ищет посетителя по ИИН: сначала в ГБДФЛ (как FindByIIN в BpDazApp),
    /// при выключенной или недоступной интеграции — в собственной таблице Visitors.
    /// </summary>
    Task<VisitorLookupResult?> FindByIinAsync(string iin, CancellationToken ct);
}
