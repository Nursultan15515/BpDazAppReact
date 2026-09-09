using System.ComponentModel.DataAnnotations;

namespace BpDaz.Api.Dto;

/// <summary>Строка чёрного списка посетителей.</summary>
public record BlackListItem(
    int Id,
    string? Iin,
    string? Lastname,
    string? Firstname,
    string? MiddleName,
    DateTime CreatedDate,
    string CreatedBy);

public record AddBlackListForm
{
    [Required, RegularExpression(@"^\d{12}$", ErrorMessage = "ИИН должен состоять из 12 цифр.")]
    public string Iin { get; init; } = "";

    [Required, StringLength(100, MinimumLength = 1)]
    public string Lastname { get; init; } = "";

    [Required, StringLength(100, MinimumLength = 1)]
    public string Firstname { get; init; } = "";

    [StringLength(100)]
    public string? MiddleName { get; init; }
}
