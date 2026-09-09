namespace BpDaz.Api.Infrastructure.CurrentUser;

/// <summary>
/// Текущий пользователь. Аутентификация ещё не подключена, поэтому реализация —
/// заглушка; когда появится Negotiate/JWT, меняется только регистрация в Program.
/// </summary>
public interface ICurrentUser
{
    /// <summary>Users.Id.</summary>
    int UserId { get; }

    /// <summary>Persons.Id — по нему фильтруются «мои заявки».</summary>
    int PersonId { get; }

    bool IsAdmin { get; }
}
