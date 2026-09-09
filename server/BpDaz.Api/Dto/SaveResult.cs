namespace BpDaz.Api.Dto;

/// <summary>
/// Итог сохранения справочной записи. Заменяет числовые коды (1, -1, -2, -3),
/// которыми BpDazApp отвечал из контроллеров.
/// </summary>
public enum SaveResult
{
    Ok,
    LoginTaken,
    AccountTaken,
    NotFound
}
