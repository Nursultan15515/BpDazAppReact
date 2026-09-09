namespace BpDaz.Api.Dto;

/// <summary>Сотрудник для подбора принимающего в форме заявки.</summary>
public record PersonOption(
    int Id,
    string Fio,
    string PositionName,
    string DepartmentName,
    string BuildingName,
    int PlaceId,
    string? Place,
    string? PhoneInternal);

/// <summary>Здание (Places в BpDazApp).</summary>
public record BuildingOption(int Id, string Title);

public record DepartmentOption(int Id, string Title);

public record PositionOption(int Id, string Title);
