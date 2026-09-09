using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class FailedLogonAttempt
{
    public int Id { get; set; }

    public string Login { get; set; } = null!;

    public DateTime FailedLogonDate { get; set; }
}
