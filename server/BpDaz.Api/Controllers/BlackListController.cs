using BpDaz.Api.Dto;
using BpDaz.Api.Services.BlackList;
using Microsoft.AspNetCore.Mvc;

namespace BpDaz.Api.Controllers;

[ApiController]
[Route("api/blacklist")]
public class BlackListController(IBlackListService blackList) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BlackListItem>>> GetList(
        [FromQuery] string? search, CancellationToken ct)
        => Ok(await blackList.GetListAsync(search, ct));

    [HttpPost]
    public async Task<ActionResult<BlackListItem>> Add(AddBlackListForm form, CancellationToken ct)
        => Ok(await blackList.AddAsync(form, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await blackList.DeleteAsync(id, ct) ? NoContent() : NotFound();
}
