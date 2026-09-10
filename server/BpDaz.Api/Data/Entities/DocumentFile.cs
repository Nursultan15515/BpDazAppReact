namespace BpDaz.Api.Data.Entities;

/// <summary>
/// Файл документа. Фото посетителя пишет сюда терминал (TerminalDaz) через
/// процедуру DocumentFiles_Add — бюро пропусков файлы только читает.
/// </summary>
public partial class DocumentFile
{
    /// <summary>GUID без дефисов, 32 символа — результат dbo.ClearGuid(NEWID()).</summary>
    public string Id { get; set; } = null!;

    /// <summary>Путь к файлу на диске, если он лежит не в таблице. В бою вида «aspdoc:…».</summary>
    public string? FileLocation { get; set; }

    public byte[]? Blob { get; set; }

    public string? ContentType { get; set; }

    /// <summary>Способ хранения: файл в таблице или на диске по FileLocation.</summary>
    public byte StoredInTable { get; set; }

    public DateTime? DateCreate { get; set; }

    public string? ParentId { get; set; }

    /// <summary>Уменьшенная копия. Нам не нужна, но колонка объёмная — не тянем без нужды.</summary>
    public byte[]? Thumb { get; set; }

    public short? ImageWidth { get; set; }

    public short? ImageHeight { get; set; }
}
