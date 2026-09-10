using System.ComponentModel.DataAnnotations;

namespace BpDaz.Api.Dto;

/// <summary>
/// Состояние заявки. Повторяет ERequestStatus из BpDazApp.
/// </summary>
public enum RequestStatus
{
    Default = 0,
    Decorated = 1,
    Current = 2,
    Overdue = 3,
    Done = 4,
    CardTaken = 5
}

/// <summary>Вкладки списка: все / в здании / покинувшие.</summary>
public enum RequestFilterMode
{
    All = 0,
    InBuilding = 1,
    Left = 2
}

/// <summary>Строка списка заявок.</summary>
public record RequestListItem(
    int Id,
    string VisitorName,
    string VisitorIin,
    string TargetBuilding,
    string Place,
    string Period,
    string EnterExitTime,
    DateTime? EnterTime,
    DateTime? ExitTime,
    string HostDepartment,
    string HostPersonName,
    string MakerName,
    RequestStatus Status);

/// <summary>Карточка заявки.</summary>
public record RequestDetails(
    int Id,
    DateTime Date,
    string Iin,
    string Lastname,
    string Firstname,
    string? MiddleName,
    string? Organization,
    string? MobilePhone,
    string Day,
    string TimeFrom,
    string TimeTo,
    string? Objective,
    string HostPersonName,
    string? HostPhone,
    string HostPlace,
    string Place,
    string? CardNumber,
    RequestStatus Status,
    /// <summary>Код фото из DocumentFiles. Пусто — снимка нет, блок покажет заглушку.</summary>
    string? PhotoId);

/// <summary>Файл фото посетителя из DocumentFiles.</summary>
public record VisitorPhoto(byte[] Content, string ContentType);

/// <summary>Итог создания заявки: либо карточка, либо отказ из-за чёрного списка.</summary>
public record CreateRequestResult(RequestDetails? Details, bool VisitorBlacklisted);

public record CreateRequestForm
{
    [Required, RegularExpression(@"^\d{12}$", ErrorMessage = "ИИН должен состоять из 12 цифр.")]
    public string Iin { get; init; } = "";

    [Required, StringLength(100, MinimumLength = 1)]
    public string Lastname { get; init; } = "";

    [Required, StringLength(100, MinimumLength = 1)]
    public string Firstname { get; init; } = "";

    [StringLength(100)]
    public string? MiddleName { get; init; }

    [StringLength(200)]
    public string? Organization { get; init; }

    // Телефон и цель визита в форме BpDazApp были обязательными.
    [Required(ErrorMessage = "Укажите мобильный телефон."), StringLength(50)]
    public string MobilePhone { get; init; } = "";

    [Required]
    public DateOnly Date { get; init; }

    [Required]
    public TimeOnly TimeFrom { get; init; }

    [Required]
    public TimeOnly TimeTo { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Не выбран принимающий сотрудник.")]
    public int HostPersonId { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Не выбрано здание.")]
    public int PlaceId { get; init; }

    /// <summary>Кабинет — свободный текст, как Requests.Place в BpDazApp.</summary>
    [StringLength(100)]
    public string? Place { get; init; }

    [StringLength(50)]
    public string? HostPhone { get; init; }

    [Required(ErrorMessage = "Укажите цель визита."), StringLength(500, MinimumLength = 1)]
    public string Purpose { get; init; } = "";
}
