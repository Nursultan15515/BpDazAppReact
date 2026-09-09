using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class Place
{
    /// <summary>
    /// Уникальный код записи
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Название
    /// </summary>
    public string Title { get; set; } = null!;

    public string? Code { get; set; }

    public string? Name { get; set; }

    public int? PlaceTypeId { get; set; }

    public int? ParentId { get; set; }

    /// <summary>
    /// Дата создания записи
    /// </summary>
    public DateTime? PlaceCreateDate { get; set; }

    public virtual ICollection<Place> InverseParent { get; set; } = new List<Place>();

    public virtual Place? Parent { get; set; }

    public virtual ICollection<Person> People { get; set; } = new List<Person>();

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
