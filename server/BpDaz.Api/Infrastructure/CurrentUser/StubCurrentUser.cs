namespace BpDaz.Api.Infrastructure.CurrentUser;

/// <summary>
/// Временный пользователь до подключения аутентификации.
/// Идентификаторы указывают на первую учётку из db/seed-demo.sql.
/// </summary>
public class StubCurrentUser : ICurrentUser
{
    public int UserId => 1;

    public int PersonId => 1;

    public bool IsAdmin => true;
}
