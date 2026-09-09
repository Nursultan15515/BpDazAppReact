/*
    001 — хранение пароля пользователя в dbo.Users2

    Зачем: BpDazApp (RepAuth.VerifyPassword / RepAuth.SetPassword) читает и пишет
    Users2.PasswordHash и Users2.PasswordUpdatedDate, но в выгрузке DazDbScript.sql
    этих колонок нет. Без них не сделать ни смену пароля в карточке пользователя,
    ни вход по логину и паролю.

    Что делает:
      1. добавляет Users2.PasswordHash        nvarchar(255) NULL
      2. добавляет Users2.PasswordUpdatedDate datetime      NULL
      3. создаёт уникальный индекс UX_Users2_UserId (одна строка Users2 на пользователя) —
         на него опирается код BpDazApp; если в таблице уже есть дубликаты по UserId,
         индекс НЕ создаётся, а скрипт печатает предупреждение со списком.

    Свойства:
      - идемпотентный: повторный запуск ничего не меняет;
      - данные не трогает, существующие строки получают NULL в новых колонках;
      - размер 255 рассчитан и на System.Web.Helpers.Crypto (base64, 68 символов),
        и на BCrypt (60 символов).

    Запуск:
        sqlcmd -S <сервер> -U <логин> -P <пароль> -C -d VisitorControl73 -f 65001 -i 001-users2-password.sql
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

-- ─── 1. PasswordHash ─────────────────────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Users2') AND name = 'PasswordHash')
BEGIN
    ALTER TABLE dbo.Users2 ADD PasswordHash nvarchar(255) NULL;
    PRINT 'Добавлена колонка Users2.PasswordHash.';
END
ELSE
    PRINT 'Колонка Users2.PasswordHash уже есть — пропущено.';
GO

-- ─── 2. PasswordUpdatedDate ──────────────────────────────────────────────────
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Users2') AND name = 'PasswordUpdatedDate')
BEGIN
    ALTER TABLE dbo.Users2 ADD PasswordUpdatedDate datetime NULL;
    PRINT 'Добавлена колонка Users2.PasswordUpdatedDate.';
END
ELSE
    PRINT 'Колонка Users2.PasswordUpdatedDate уже есть — пропущено.';
GO

-- ─── 3. Уникальность UserId ──────────────────────────────────────────────────
IF EXISTS (SELECT 1 FROM sys.indexes
           WHERE object_id = OBJECT_ID('dbo.Users2') AND name = 'UX_Users2_UserId')
BEGIN
    PRINT 'Индекс UX_Users2_UserId уже есть — пропущено.';
END
ELSE IF EXISTS (SELECT 1 FROM dbo.Users2 GROUP BY UserId HAVING COUNT(*) > 1)
BEGIN
    PRINT 'ВНИМАНИЕ: в Users2 есть несколько строк на одного пользователя,';
    PRINT 'уникальный индекс UX_Users2_UserId НЕ создан. Дубликаты:';

    SELECT UserId, COUNT(*) AS rows_count
    FROM dbo.Users2
    GROUP BY UserId
    HAVING COUNT(*) > 1
    ORDER BY UserId;
END
ELSE
BEGIN
    CREATE UNIQUE INDEX UX_Users2_UserId ON dbo.Users2 (UserId);
    PRINT 'Создан уникальный индекс UX_Users2_UserId.';
END
GO

-- ─── Итог ────────────────────────────────────────────────────────────────────
SELECT
    c.name AS column_name,
    t.name AS data_type,
    CASE WHEN t.name = 'nvarchar' THEN c.max_length / 2 ELSE c.max_length END AS length,
    c.is_nullable
FROM sys.columns c
JOIN sys.types t ON t.user_type_id = c.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.Users2')
ORDER BY c.column_id;
