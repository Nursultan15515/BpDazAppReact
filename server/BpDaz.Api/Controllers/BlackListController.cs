using BpDaz.Api.Dto;
using BpDaz.Api.Services.BlackList;
using BpDaz.Api.Infrastructure.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BpDaz.Api.Controllers;

[ApiController]
// Справочники и чёрный список в BpDazApp были доступны только администратору.
[Authorize(Roles = AppRoles.Admin)]
[Route("api/blacklist")]
public class BlackListController(IBlackListService blackList) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<BlackListItem>>> GetList(
        CancellationToken ct,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = Paging.DefaultPageSize)
        => Ok(await blackList.GetListAsync(search, page, pageSize, ct));

    [HttpPost]
    public async Task<ActionResult<BlackListItem>> Add(AddBlackListForm form, CancellationToken ct)
        => Ok(await blackList.AddAsync(form, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await blackList.DeleteAsync(id, ct) ? NoContent() : NotFound();
}
