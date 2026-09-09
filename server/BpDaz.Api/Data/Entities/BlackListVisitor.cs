using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class BlackListVisitor
{
    public int Id { get; set; }

    public string? LastName { get; set; }

    public string? FirstName { get; set; }

    public string? MiddleName { get; set; }

    public string? Iin { get; set; }

    public DateTime CreatedDate { get; set; }

    public int UserId { get; set; }

    public DateTime? DeletedDate { get; set; }
}
