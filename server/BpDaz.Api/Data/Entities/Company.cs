using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class Company
{
    /// <summary>
    /// Уникальный код записи
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Название
    /// </summary>
    public string Title { get; set; } = null!;

    /// <summary>
    /// Полное имя
    /// </summary>
    public string? Fullname { get; set; }

    public string? Email { get; set; }

    /// <summary>
    /// Статус: 0- удален
    /// </summary>
    public byte CompanyStatus { get; set; }

    /// <summary>
    /// ИД объекта в интегрирующейся системе
    /// </summary>
    public string? CompanyObjectId { get; set; }

    /// <summary>
    /// Не производить синхронизацию
    /// </summary>
    public byte? NoSync { get; set; }

    public DateTime CompanyCreateDate { get; set; }

    public int? ParkingQuota { get; set; }

    /// <summary>
    /// Иностранное наименование комании
    /// </summary>
    public string? ForeignName { get; set; }

    public int? LogoId { get; set; }

    public virtual ICollection<Department> Departments { get; set; } = new List<Department>();

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
