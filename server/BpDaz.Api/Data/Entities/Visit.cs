using System;
using System.Collections.Generic;

namespace BpDaz.Api.Data.Entities;

public partial class Visit
{
    /// <summary>
    /// Уникальный код записи
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Код заявки
    /// </summary>
    public int RequestId { get; set; }

    /// <summary>
    /// Код пользователя  подписавшего заявку
    /// </summary>
    public int? SignerId { get; set; }

    /// <summary>
    /// Замечания
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Дата и время выхода
    /// </summary>
    public DateTime? DateExit { get; set; }

    /// <summary>
    /// Код документа посетителя
    /// </summary>
    public int? VisitorDocumentId { get; set; }

    /// <summary>
    /// Код машины посетителя
    /// </summary>
    public int? VisitorCarId { get; set; }

    /// <summary>
    /// Дата окончания
    /// </summary>
    public DateTime? DateEnd { get; set; }

    /// <summary>
    /// Фото посетителя на момент оформления
    /// </summary>
    public string? DocumentFilesId { get; set; }

    /// <summary>
    /// Номер пропуска
    /// </summary>
    public int? VisitNumber { get; set; }

    /// <summary>
    /// Читаемый номер карты доступа
    /// </summary>
    public string? CardReadableNum { get; set; }

    /// <summary>
    /// Отметка о выходе проставлена автоматически
    /// </summary>
    public bool? IsAutoCheckout { get; set; }

    /// <summary>
    /// Машину разрешено оставить на ночь
    /// </summary>
    public bool? StayCar { get; set; }

    /// <summary>
    /// Дата/время прохода посетителя через турникет
    /// </summary>
    public DateTime? VisitorDateIn { get; set; }

    /// <summary>
    /// Дата и время начала периода действия Пропуска
    /// </summary>
    public DateTime ValidFrom { get; set; }

    /// <summary>
    /// Дата и время окончания периода действия Пропуска
    /// </summary>
    public DateTime ValidTo { get; set; }

    /// <summary>
    /// Начало периода действия пропуска внутри суток, в минутах от начала суток
    /// </summary>
    public short? ValidMinutesFrom { get; set; }

    /// <summary>
    /// Конец периода действия пропуска внутри суток, в минутах от начала суток
    /// </summary>
    public short? ValidMinutesTo { get; set; }

    /// <summary>
    /// Дата и время создания пропуска
    /// </summary>
    public DateTime CreateDate { get; set; }

    public int? PlaceId { get; set; }

    /// <summary>
    /// Тип пропуска
    /// </summary>
    public int VisitType { get; set; }

    public virtual Place? Place { get; set; }

    public virtual Request Request { get; set; } = null!;
}
