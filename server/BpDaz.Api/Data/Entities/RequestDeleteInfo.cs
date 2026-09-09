using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class RequestDeleteInfo
{
    public long Id { get; set; }

    public int RequestId { get; set; }

    public DateTime CreatedDate { get; set; }

    public int UserId { get; set; }

    public int VisitorId { get; set; }
}
