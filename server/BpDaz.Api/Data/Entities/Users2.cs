using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class Users2
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string AccountName { get; set; } = null!;

    public bool IsAdmin { get; set; }

    public string? PasswordHash { get; set; }

    public DateTime? PasswordUpdatedDate { get; set; }
}
