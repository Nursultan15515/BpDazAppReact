namespace BpDaz.Api.Dto;

/// <summary>Откуда взялись данные посетителя.</summary>
public enum VisitorLookupSource
{
    /// <summary>Из таблицы Visitors — посетитель уже приходил.</summary>
    Local,

    /// <summary>Из внешнего сервиса ГБДФЛ.</summary>
    Gbdfl
}

public record VisitorLookupResult(
    VisitorLookupSource Source,
    int VisitorId,
    string Iin,
    string? Lastname,
    string? Firstname,
    string? MiddleName,
    string? Organization,
    string? MobilePhone);
