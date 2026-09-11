using BpDaz.Api.Dto;
using ClosedXML.Excel;

namespace BpDaz.Api.Services.Requests;

/// <summary>
/// Книга Excel со списком заявок. В BpDazApp её собирал Kendo прямо в браузере
/// (grid.saveAsExcel с AllPages(true)); здесь то же самое делает сервер, поэтому
/// в файл попадает вся отфильтрованная выборка, а не видимая страница.
/// </summary>
public static class RequestsExcel
{
    public const string ContentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    /// <summary>Имя файла повторяет FileName из настроек грида BpDazApp.</summary>
    public const string FileName = "Список посетителей.xlsx";

    private static readonly string[] Headers =
    [
        "№", "Посетитель", "ИИН", "Здание", "Кабинет", "Период",
        "Вход - выход", "Отдел", "Принимающий", "Автор", "Статус",
    ];

    private static readonly Dictionary<RequestStatus, string> StatusNames = new()
    {
        [RequestStatus.Default] = "",
        [RequestStatus.Decorated] = "Оформлен",
        [RequestStatus.Current] = "Действующий",
        [RequestStatus.Overdue] = "Просрочен",
        [RequestStatus.Done] = "Отработано",
        [RequestStatus.CardTaken] = "Карта получена",
    };

    public static byte[] Build(IReadOnlyList<RequestListItem> rows)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.AddWorksheet("Посетители");

        for (var i = 0; i < Headers.Length; i++)
            sheet.Cell(1, i + 1).Value = Headers[i];

        var header = sheet.Range(1, 1, 1, Headers.Length);
        header.Style.Font.Bold = true;
        header.Style.Fill.BackgroundColor = XLColor.FromArgb(0xE8, 0xEA, 0xF6);
        header.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

        var row = 2;
        foreach (var item in rows)
        {
            sheet.Cell(row, 1).Value = item.Id;
            sheet.Cell(row, 2).Value = item.VisitorName;
            // ИИН — текстом, иначе Excel съест ведущие нули и покажет 8,7E+11.
            sheet.Cell(row, 3).SetValue(item.VisitorIin).Style.NumberFormat.Format = "@";
            sheet.Cell(row, 4).Value = item.TargetBuilding;
            sheet.Cell(row, 5).Value = item.Place;
            sheet.Cell(row, 6).Value = item.Period;
            sheet.Cell(row, 7).Value = item.EnterExitTime;
            sheet.Cell(row, 8).Value = item.HostDepartment;
            sheet.Cell(row, 9).Value = item.HostPersonName;
            sheet.Cell(row, 10).Value = item.MakerName;
            sheet.Cell(row, 11).Value = StatusNames.GetValueOrDefault(item.Status, "");
            row++;
        }

        if (rows.Count > 0)
            sheet.Range(1, 1, rows.Count + 1, Headers.Length).SetAutoFilter();

        sheet.SheetView.FreezeRows(1);
        sheet.Columns().AdjustToContents(1, 200, 8, 55);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
