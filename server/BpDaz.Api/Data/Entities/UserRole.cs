using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class UserRole
{
    public int Id { get; set; }

    /// <summary>
    /// Код пользователя
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Код роли
    /// </summary>
    public int RoleId { get; set; }

    /// <summary>
    /// Код компании
    /// </summary>
    public int? BaseCompanyId { get; set; }

    /// <summary>
    /// Код подразделения
    /// </summary>
    public int? BaseDepartmentId { get; set; }

    /// <summary>
    /// Код места
    /// </summary>
    public int? BasePlaceId { get; set; }

    public virtual Company? BaseCompany { get; set; }

    public virtual Department? BaseDepartment { get; set; }

    public virtual Place? BasePlace { get; set; }

    public virtual Role Role { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
