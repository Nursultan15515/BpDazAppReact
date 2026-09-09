using System.ComponentModel.DataAnnotations;

namespace BpDaz.Api.Dto;

/// <summary>Строка справочника сотрудников.</summary>
public record PersonListItem(
    int Id,
    string Fio,
    string? Lastname,
    string? Firstname,
    string? MiddleName,
    string DepartmentName,
    string PositionName,
    string BuildingName,
    string? Place,
    string? PhoneInternal,
    string? Phone,
    string? Email,
    string? Login);

public record CreatePersonForm
{
    [Required, StringLength(100, MinimumLength = 1)]
    public string Lastname { get; init; } = "";

    [Required, StringLength(100, MinimumLength = 1)]
    public string Firstname { get; init; } = "";

    [StringLength(100)]
    public string? MiddleName { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Не выбран отдел.")]
    public int DepartmentId { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Не выбрана должность.")]
    public int PositionId { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Не выбрано здание.")]
    public int PlaceId { get; init; }

    /// <summary>Кабинет — свободный текст, как Persons.Place.</summary>
    [StringLength(100)]
    public string? Place { get; init; }

    [EmailAddress, StringLength(200)]
    public string? Email { get; init; }

    [StringLength(50)]
    public string? PhoneInternal { get; init; }

    [StringLength(50)]
    public string? Phone { get; init; }

    /// <summary>Заводить ли вместе с сотрудником учётку бюро пропусков.</summary>
    public bool IsUserOfSystem { get; init; }

    [StringLength(100)]
    public string? Login { get; init; }

    /// <summary>Доменная учётка. В этой схеме Users2.AccountName — NOT NULL.</summary>
    [StringLength(200)]
    public string? AccountName { get; init; }
}
