using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class Department
{
    /// <summary>
    /// Уникальный код записи
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Код
    /// </summary>
    public string Code { get; set; } = null!;

    /// <summary>
    /// Название
    /// </summary>
    public string Title { get; set; } = null!;

    /// <summary>
    /// Полное имя
    /// </summary>
    public string? Fullname { get; set; }

    /// <summary>
    /// Код компании
    /// </summary>
    public int CompanyId { get; set; }

    /// <summary>
    /// Статус (активен/неактивен)
    /// </summary>
    public byte Status { get; set; }

    /// <summary>
    /// Код родителя
    /// </summary>
    public int? ParentId { get; set; }

    public string? Email { get; set; }

    public string? DepartmentObjectId { get; set; }

    /// <summary>
    /// Не производить синхронизацию
    /// </summary>
    public byte NoSync { get; set; }

    public DateTime DepartmentCreateDate { get; set; }

    public virtual Company Company { get; set; } = null!;

    public virtual ICollection<Department> InverseParent { get; set; } = new List<Department>();

    public virtual Department? Parent { get; set; }

    public virtual ICollection<Person> People { get; set; } = new List<Person>();

    public virtual ICollection<Request> RequestHostDepartments { get; set; } = new List<Request>();

    public virtual ICollection<Request> RequestInitDepartments { get; set; } = new List<Request>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
