namespace BpDaz.Api.Infrastructure.CurrentUser;

public interface ICurrentUser
{
    bool IsAuthenticated { get; }

    /// <summary>
    /// Пользователь опознан операционной системой, но в базе бюро пропусков его нет:
    /// доменную учётку ещё не привязали к логину. Аналог SetAccountNameByLogin.
    /// </summary>
    bool IsLinked { get; }

    /// <summary>Логин в базе (парольный режим) или DOMAIN\user (доменный).</summary>
    string Name { get; }

    /// <summary>Users.Id.</summary>
    int UserId { get; }

    /// <summary>Persons.Id — по нему фильтруются «мои заявки».</summary>
    int PersonId { get; }

    bool IsAdmin { get; }
}
