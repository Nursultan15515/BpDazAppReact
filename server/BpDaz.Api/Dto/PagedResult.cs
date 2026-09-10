namespace BpDaz.Api.Dto;

/// <summary>
/// Страница списка: строки текущей страницы плюс счётчики для пагинации.
/// TotalPages считается на сервере, чтобы клиент не повторял арифметику.
/// </summary>
public record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize)
{
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 1;
}

/// <summary>Приведение параметров страницы к допустимым значениям.</summary>
public static class Paging
{
    public const int DefaultPageSize = 50;

    /// <summary>Потолок берём из Kendo-грида BpDazApp — там максимум был 500 строк.</summary>
    public const int MaxPageSize = 500;

    public static (int Page, int PageSize) Normalize(int page, int pageSize) => (
        page < 1 ? 1 : page,
        pageSize switch
        {
            < 1 => DefaultPageSize,
            > MaxPageSize => MaxPageSize,
            _ => pageSize,
        });
}
