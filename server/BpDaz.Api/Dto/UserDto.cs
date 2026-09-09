using System.ComponentModel.DataAnnotations;

namespace BpDaz.Api.Dto;

/// <summary>Строка справочника пользователей системы.</summary>
public record UserListItem(
    int Id,
    int? PersonId,
    string Fio,
    string? Login,
    string? AccountName,
    string DepartmentName,
    string? Place,
    string? Phone,
    bool IsAdmin);

/// <summary>Карточка пользователя для редактирования.</summary>
public record UserEditItem(
    int Id,
    string? Lastname,
    string? Firstname,
    string? MiddleName,
    string? Login,
    string? AccountName,
    bool IsAdmin);

public record UserEditForm
{
    [StringLength(100)]
    public string? Lastname { get; init; }

    [StringLength(100)]
    public string? Firstname { get; init; }

    [StringLength(100)]
    public string? MiddleName { get; init; }

    [Required, StringLength(100, MinimumLength = 1)]
    public string Login { get; init; } = "";

    [Required, StringLength(200, MinimumLength = 1)]
    public string AccountName { get; init; } = "";

    public bool IsAdmin { get; init; }
}
