using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class Visitor
{
    /// <summary>
    /// Уникальный код записи
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Фамилия
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// Имя
    /// </summary>
    public string? Firstname { get; set; }

    /// <summary>
    /// Отчество
    /// </summary>
    public string? MiddleName { get; set; }

    /// <summary>
    /// Название организации
    /// </summary>
    public string? Firm { get; set; }

    /// <summary>
    /// E-Mail получателя сообщения
    /// </summary>
    public string? Address { get; set; }

    /// <summary>
    /// Телефон
    /// </summary>
    public string? Phones { get; set; }

    /// <summary>
    /// E-мейл
    /// </summary>
    public string? Email { get; set; }

    public int? OriginalId { get; set; }

    /// <summary>
    /// Дата создания записи
    /// </summary>
    public DateTime? CreateDate { get; set; }

    /// <summary>
    /// Статус (активен/неактивен)
    /// </summary>
    public byte Status { get; set; }

    public string? DocumentFilesId { get; set; }

    /// <summary>
    /// 1 - Автоматически созданное имя посетителя
    /// </summary>
    public byte IsAutoGuest { get; set; }

    /// <summary>
    /// 1 - Иностранный гражданин
    /// </summary>
    public byte IsAlien { get; set; }

    /// <summary>
    /// Дата рождения
    /// </summary>
    public DateTime? Birthdate { get; set; }

    /// <summary>
    /// Место рождения
    /// </summary>
    public string? Birthplace { get; set; }

    public string? VisitorNotes { get; set; }

    public string? Position { get; set; }

    /// <summary>
    /// Тип посетителя, 0 - обычный, 1 - постоянный, 2 - временный постоянный (Постоянный посетитель без привязки к сотруднику. Должен быть привязан к сотруднику и переведен в тип 1 при создании постоянного пропуска)
    /// </summary>
    public byte TypeId { get; set; }

    /// <summary>
    /// Галка присутствия отчества у посетителя
    /// </summary>
    public bool HasMiddlename { get; set; }

    public string Fio { get; set; } = null!;

    /// <summary>
    /// ИИН
    /// </summary>
    public string? Iin { get; set; }

    /// <summary>
    /// Мобильный телефон
    /// </summary>
    public string? MobilePhone { get; set; }

    public virtual ICollection<Visitor> InverseOriginal { get; set; } = new List<Visitor>();

    public virtual Visitor? Original { get; set; }

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();
}
