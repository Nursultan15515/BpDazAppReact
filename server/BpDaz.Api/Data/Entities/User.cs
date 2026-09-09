using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class User
{
    /// <summary>
    /// Уникальный код записи
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Логин
    /// </summary>
    public string? Login { get; set; }

    /// <summary>
    /// Пароль
    /// </summary>
    public string? Password { get; set; }

    /// <summary>
    /// Код персоны
    /// </summary>
    public int? PersonId { get; set; }

    /// <summary>
    /// Статус (1 - активен, 0 - неактивен, 2 - забанен)
    /// </summary>
    public byte Status { get; set; }

    /// <summary>
    /// Дата и время последнего изменения пароля
    /// </summary>
    public DateTime LastPasswordUpdate { get; set; }

    /// <summary>
    /// Число входов в систему после истечения пароля
    /// </summary>
    public byte EnterAfterExpires { get; set; }

    /// <summary>
    /// Функция, возвращающая IP-адрес текущего пользователя
    /// </summary>
    public string? Ipaddress { get; set; }

    /// <summary>
    /// Сетевой логин пользователя
    /// </summary>
    public string? Ntusername { get; set; }

    /// <summary>
    /// MAC-адрес сетевой платы
    /// </summary>
    public string? Macaddress { get; set; }

    /// <summary>
    /// Имя компьютера
    /// </summary>
    public string? ComputerName { get; set; }

    /// <summary>
    /// Имя пользователя в сети
    /// </summary>
    public string? LogonUser { get; set; }

    /// <summary>
    /// Есть ли привязка к физическому рабочему месту
    /// </summary>
    public byte? IsBinding { get; set; }

    /// <summary>
    /// Допустим ли вход по сетевому имени
    /// </summary>
    public byte? IsAllowNtautologon { get; set; }

    /// <summary>
    /// Последнее время входа в систему
    /// </summary>
    public DateTime? LastLogonTime { get; set; }

    /// <summary>
    /// Дата начала полномочий
    /// </summary>
    public DateTime? StartDate { get; set; }

    public DateTime? LastEditDate { get; set; }

    public byte? UserOnlineState { get; set; }

    public string? Hash1 { get; set; }

    public string? Hash2 { get; set; }

    /// <summary>
    /// Данные о привязке к ПК
    /// </summary>
    public string? ClientInfoPc { get; set; }

    /// <summary>
    /// Данные о привязке к мобильному
    /// </summary>
    public string? ClientInfoMobile { get; set; }

    /// <summary>
    /// Тип: 0 - обычный, 1 - мобильный
    /// </summary>
    public byte UserType { get; set; }

    /// <summary>
    /// Разрешение на использование функционала VisitorControl
    /// </summary>
    public bool IsVcallowed { get; set; }

    /// <summary>
    /// Разрешение на использование функционала ServiceDesk
    /// </summary>
    public bool IsSdallowed { get; set; }

    /// <summary>
    /// Причина бана (постоянной блокировки) пользователя
    /// </summary>
    public string? BanReason { get; set; }

    public virtual Person? Person { get; set; }

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
