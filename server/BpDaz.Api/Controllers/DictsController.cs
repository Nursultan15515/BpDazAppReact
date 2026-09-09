using BpDaz.Api.Dto;
using BpDaz.Api.Services.Dicts;
using Microsoft.AspNetCore.Mvc;

namespace BpDaz.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DictsController(IDictService dicts) : ControllerBase
{
    [HttpGet("persons")]
    public async Task<ActionResult<IReadOnlyList<PersonOption>>> SearchPersons(
        [FromQuery] string? search, CancellationToken ct)
        => Ok(await dicts.SearchPersonsAsync(search, ct));

    [HttpGet("buildings")]
    public async Task<ActionResult<IReadOnlyList<BuildingOption>>> GetBuildings(CancellationToken ct)
        => Ok(await dicts.GetBuildingsAsync(ct));

    [HttpGet("departments")]
    public async Task<ActionResult<IReadOnlyList<DepartmentOption>>> GetDepartments(CancellationToken ct)
        => Ok(await dicts.GetDepartmentsAsync(ct));

    [HttpGet("positions")]
    public async Task<ActionResult<IReadOnlyList<PositionOption>>> GetPositions(CancellationToken ct)
        => Ok(await dicts.GetPositionsAsync(ct));

    [HttpGet("organizations")]
    public async Task<ActionResult<IReadOnlyList<string>>> SearchOrganizations(
        [FromQuery] string? search, CancellationToken ct)
        => Ok(await dicts.SearchOrganizationsAsync(search, ct));
}
