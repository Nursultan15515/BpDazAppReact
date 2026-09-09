using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class Position
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
    /// Код в системе &quot;Босс-Кадровик&quot;
    /// </summary>
    public int? BossKadrovikId { get; set; }

    public int? PositionCompanyId { get; set; }

    public bool Status { get; set; }

    public virtual ICollection<Person> People { get; set; } = new List<Person>();
}
