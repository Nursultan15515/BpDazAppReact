using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class Request
{
    /// <summary>
    /// Уникальный код записи
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Дата записи
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Дата с
    /// </summary>
    public DateTime DateFrom { get; set; }

    /// <summary>
    /// Дата по
    /// </summary>
    public DateTime DateTo { get; set; }

    /// <summary>
    /// Максимально допустимое количество визитов
    /// </summary>
    public int NumOfVisits { get; set; }

    /// <summary>
    /// Код принимающей компании
    /// </summary>
    public int? HostCompanyId { get; set; }

    /// <summary>
    /// Код принимающего подразделения
    /// </summary>
    public int? HostDepartmentId { get; set; }

    /// <summary>
    /// Код принимающего сотрудника
    /// </summary>
    public int? HostPersonId { get; set; }

    /// <summary>
    /// Код пользователя автора заявки
    /// </summary>
    public int? MakerId { get; set; }

    /// <summary>
    /// Код сотрудника, кому было выслано для согласования
    /// </summary>
    public int? ForSignerId { get; set; }

    /// <summary>
    /// Код пользователя  подписавшего заявку
    /// </summary>
    public int? SignerId { get; set; }

    /// <summary>
    /// Подразделение-инициатор
    /// </summary>
    public int? InitDepartmentId { get; set; }

    /// <summary>
    /// Код сотрудника, отозвавшего заявку
    /// </summary>
    public int? CancelerId { get; set; }

    /// <summary>
    /// Код посетителя
    /// </summary>
    public int VisitorId { get; set; }

    /// <summary>
    /// Код документа посетителя
    /// </summary>
    public int? VisitorDocumentId { get; set; }

    /// <summary>
    /// Код машины посетителя
    /// </summary>
    public int? VisitorCarId { get; set; }

    /// <summary>
    /// Количество оставшихся допустимых визитов по заявке
    /// </summary>
    public int VisitsToEnd { get; set; }

    /// <summary>
    /// Код здания
    /// </summary>
    public int? PlaceId { get; set; }

    /// <summary>
    /// Место
    /// </summary>
    public string? Place { get; set; }

    /// <summary>
    /// Цель последнего посещения посетителя
    /// </summary>
    public string? Objective { get; set; }

    /// <summary>
    /// Дата отмены (отзыва)
    /// </summary>
    public DateTime? CancelDate { get; set; }

    /// <summary>
    /// Дата и время подписания
    /// </summary>
    public DateTime? SignDate { get; set; }

    /// <summary>
    /// Код принятого решения
    /// </summary>
    public byte? Decision { get; set; }

    /// <summary>
    /// Резолюция
    /// </summary>
    public string? Resolution { get; set; }

    /// <summary>
    /// Время последнего обновления информации
    /// </summary>
    public DateTime? LastUpdateDate { get; set; }

    /// <summary>
    /// Заметки операторов по заявке
    /// </summary>
    public string? RequestNotes { get; set; }

    /// <summary>
    /// Доп. информация (ноутбук и пр.)
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// 1- Оставить машину на ночь
    /// </summary>
    public bool? StayCar { get; set; }

    public byte MoveDirection { get; set; }

    /// <summary>
    /// Заявка фиктивная = 1
    /// </summary>
    public bool IsRegistration { get; set; }

    public int? RequestType { get; set; }

    /// <summary>
    /// Телефон принимающей стороны
    /// </summary>
    public string? HostPhone { get; set; }

    public int? PinId { get; set; }

    public virtual Person? Canceler { get; set; }

    public virtual Company? HostCompany { get; set; }

    public virtual Department? HostDepartment { get; set; }

    public virtual Person? HostPerson { get; set; }

    public virtual Department? InitDepartment { get; set; }

    public virtual Person? Maker { get; set; }

    public virtual Place? PlaceNavigation { get; set; }

    public virtual Person? Signer { get; set; }

    public virtual Visitor Visitor { get; set; } = null!;

    public virtual ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
