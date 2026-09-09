using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class Role
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
    /// Описание
    /// </summary>
    public string? Description { get; set; }

    public bool IsSystemRole { get; set; }

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
