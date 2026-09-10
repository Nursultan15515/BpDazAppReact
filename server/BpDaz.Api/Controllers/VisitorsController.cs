using System.ComponentModel.DataAnnotations;
using BpDaz.Api.Dto;
using BpDaz.Api.Services.Visitors;
using Microsoft.AspNetCore.Mvc;

namespace BpDaz.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisitorsController(IVisitorService visitors) : ControllerBase
{
    /// <summary>Поиск посетителя по ИИН — кнопка «Поиск» в форме заявки.</summary>
    [HttpGet("by-iin")]
    public async Task<ActionResult<VisitorLookupResult>> FindByIin(
        [FromQuery, Required, RegularExpression(@"^\d{12}$", ErrorMessage = "ИИН должен состоять из 12 цифр.")]
        string iin,
        CancellationToken ct)
    {
        var result = await visitors.FindByIinAsync(iin, ct);

        return result == null
            ? NotFound(new ProblemDetails
            {
                Title = "Посетитель не найден",
                Detail = $"Посетитель с ИИН {iin} не найден.",
                Status = StatusCodes.Status404NotFound,
            })
            : Ok(result);
    }
}
