using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class Person
{
    /// <summary>
    /// Уникальный код записи
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Фамилия
    /// </summary>
    public string? Lastname { get; set; }

    /// <summary>
    /// Имя
    /// </summary>
    public string? Firstname { get; set; }

    /// <summary>
    /// Отчество
    /// </summary>
    public string? MiddleName { get; set; }

    /// <summary>
    /// Код должности
    /// </summary>
    public int? PositionId { get; set; }

    /// <summary>
    /// E-мейл
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Телефон внутренний
    /// </summary>
    public string? PhoneInternal { get; set; }

    /// <summary>
    /// Телефон
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// Место
    /// </summary>
    public string? Place { get; set; }

    /// <summary>
    /// Код подразделения текущего пользователя
    /// </summary>
    public int DepartmentId { get; set; }

    /// <summary>
    /// Статус (активен/неактивен)
    /// </summary>
    public byte Status { get; set; }

    /// <summary>
    /// Код здания
    /// </summary>
    public int? PlaceId { get; set; }

    /// <summary>
    /// Тип уведомления
    /// </summary>
    public byte? NotificationType { get; set; }

    /// <summary>
    /// Флаг наличия постоянного пропуска
    /// </summary>
    public byte? HasPermanentPaper { get; set; }

    /// <summary>
    /// Номер постоянного пропуска
    /// </summary>
    public string? PermanentPaperNumber { get; set; }

    /// <summary>
    /// Код, выбранного параметра
    /// </summary>
    public int? OwnerId { get; set; }

    /// <summary>
    /// Код в системе &quot;Босс-Кадровик&quot;
    /// </summary>
    public int? BossKadrovikId { get; set; }

    /// <summary>
    /// Дата создания записи
    /// </summary>
    public DateTime? CreateDate { get; set; }

    /// <summary>
    /// Домашний телефон
    /// </summary>
    public string? HomePhone { get; set; }

    /// <summary>
    /// Специальный сотрудник для системного использования
    /// </summary>
    public bool IsSystemPerson { get; set; }

    /// <summary>
    /// Не производить синхронизацию=1
    /// </summary>
    public bool NoSync { get; set; }

    /// <summary>
    /// Id предка данной сущности (существовавшей до изменения сотрудника)
    /// </summary>
    public int? OldId { get; set; }

    public string? RegNumber { get; set; }

    public bool IsDirector { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? FinishDate { get; set; }

    public string? Fio { get; set; }

    public virtual Department Department { get; set; } = null!;

    public virtual Place? PlaceNavigation { get; set; }

    public virtual Position? Position { get; set; }

    public virtual ICollection<Request> RequestCancelers { get; set; } = new List<Request>();

    public virtual ICollection<Request> RequestHostPeople { get; set; } = new List<Request>();

    public virtual ICollection<Request> RequestMakers { get; set; } = new List<Request>();

    public virtual ICollection<Request> RequestSigners { get; set; } = new List<Request>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
