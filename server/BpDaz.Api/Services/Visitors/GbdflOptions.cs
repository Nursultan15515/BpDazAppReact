namespace BpDaz.Api.Services.Visitors;

/// <summary>
/// Параметры сервиса ГБДФЛ. В BpDazApp адрес и ключ были зашиты прямо в
/// VisitorsController.FindByIIN, здесь они вынесены в конфигурацию.
/// </summary>
public class GbdflOptions
{
    /// <summary>Полный адрес метода, например http://172.20.245.13/api/GBDFL/GetByIIN</summary>
    public string BaseUrl { get; set; } = "";

    public string Key { get; set; } = "";

    /// <summary>Общий таймаут запроса.</summary>
    public int TimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Таймаут установки соединения. Держим коротким отдельно от общего:
    /// если сервис недоступен, кнопка «Поиск» не должна висеть полминуты,
    /// но у доступного сервиса остаётся полный TimeoutSeconds на ответ.
    /// </summary>
    public int ConnectTimeoutSeconds { get; set; } = 5;

    /// <summary>
    /// Ходить ли к сервису через системный прокси. По умолчанию нет: ГБДФЛ во
    /// внутренней сети, а через корпоративный прокси запрос к нему всё равно
    /// не пройдёт — и вместо быстрого отказа получится ожидание во весь таймаут.
    /// </summary>
    public bool UseProxy { get; set; }

    /// <summary>Пустой адрес или ключ означают, что интеграция выключена.</summary>
    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(BaseUrl) && !string.IsNullOrWhiteSpace(Key);
}
