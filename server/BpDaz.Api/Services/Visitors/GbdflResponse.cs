namespace BpDaz.Api.Services.Visitors;

/// <summary>
/// Ответ ГБДФЛ. Берём только те поля, которые нужны форме заявки;
/// остальное (адреса, гражданство, документы) сервис отдаёт, но мы не используем.
/// </summary>
public class GbdflResponse
{
    public bool response_result { get; set; }

    public string? response_message { get; set; }

    public string? iin { get; set; }

    public string? surname { get; set; }

    public string? firstname { get; set; }

    public string? secondname { get; set; }

    public DateTime? birth_date { get; set; }
}
