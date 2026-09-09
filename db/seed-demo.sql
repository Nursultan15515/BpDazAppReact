/*
    Демоданные для локальной разработки.

    ВНИМАНИЕ: скрипт сначала ОЧИЩАЕТ таблицы, которые заполняет
    (Visits, RequestDeleteInfo, Requests, Visitors, Users2, Users, Persons,
    Places, Positions, Departments, Companies). Запускать только на локальной
    базе VisitorControl73, не на боевой.

    Запуск (файл в UTF-8, поэтому -f 65001 обязателен — без него sqlcmd
    прочитает кириллицу в кодировке консоли и запишет в базу мусор):
        sqlcmd -S localhost -U sa -P <пароль> -C -d VisitorControl73 -f 65001 -i seed-demo.sql
*/

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

DELETE FROM dbo.Visits;
DELETE FROM dbo.RequestDeleteInfo;
DELETE FROM dbo.Requests;
DELETE FROM dbo.BlackListVisitors;
DELETE FROM dbo.Visitors;
DELETE FROM dbo.UserRoles;
DELETE FROM dbo.Users2;
DELETE FROM dbo.Users;
DELETE FROM dbo.Roles;
DELETE FROM dbo.Persons;
DELETE FROM dbo.Places;
DELETE FROM dbo.Positions;
DELETE FROM dbo.Departments;
DELETE FROM dbo.Companies;

-- ─── Организация ─────────────────────────────────────────────────────────────
SET IDENTITY_INSERT dbo.Companies ON;
INSERT INTO dbo.Companies (Id, Title, Fullname, CompanyStatus, CompanyCreateDate)
VALUES (1, N'ИТЦ', N'РГП на ПХВ "ИТЦ УДП РК"', 1, GETDATE());
SET IDENTITY_INSERT dbo.Companies OFF;

-- ─── Отделы ──────────────────────────────────────────────────────────────────
SET IDENTITY_INSERT dbo.Departments ON;
INSERT INTO dbo.Departments (Id, Code, Title, Fullname, CompanyID, Status, NoSync, DepartmentCreateDate)
VALUES
    (1, N'DEV',   N'Отдел разработки',   N'Отдел разработки',            1, 1, 0, GETDATE()),
    (2, N'HR',    N'Отдел кадров',       N'Отдел кадров',                1, 1, 0, GETDATE()),
    (3, N'FIN',   N'Финансовый отдел',   N'Финансовый отдел',            1, 1, 0, GETDATE()),
    (4, N'DOC',   N'Канцелярия',         N'Канцелярия',                  1, 1, 0, GETDATE()),
    (5, N'BOSS',  N'Руководство',        N'Руководство',                 1, 1, 0, GETDATE()),
    (6, N'OPS',   N'Отдел эксплуатации', N'Отдел эксплуатации зданий',   1, 1, 0, GETDATE());
SET IDENTITY_INSERT dbo.Departments OFF;

-- ─── Должности ───────────────────────────────────────────────────────────────
SET IDENTITY_INSERT dbo.Positions ON;
INSERT INTO dbo.Positions (Id, Title, PositionCompanyID, Status)
VALUES
    (1, N'Ведущий инженер-программист', 1, 1),
    (2, N'Начальник отдела',            1, 1),
    (3, N'Главный специалист',          1, 1),
    (4, N'Специалист',                  1, 1),
    (5, N'Заместитель директора',       1, 1),
    (6, N'Инженер',                     1, 1);
SET IDENTITY_INSERT dbo.Positions OFF;

-- ─── Здания ──────────────────────────────────────────────────────────────────
-- Здание = площадка верхнего уровня (ParentID IS NULL); кабинеты в Requests.Place.
SET IDENTITY_INSERT dbo.Places ON;
INSERT INTO dbo.Places (Id, Title, Name, Code, ParentID, PlaceCreateDate)
VALUES
    (1, N'Главный корпус',          N'Главный корпус',          N'K1', NULL, GETDATE()),
    (2, N'Корпус Б',                N'Корпус Б',                N'K2', NULL, GETDATE()),
    (3, N'Административное здание', N'Административное здание', N'K3', NULL, GETDATE());
SET IDENTITY_INSERT dbo.Places OFF;

-- ─── Сотрудники ──────────────────────────────────────────────────────────────
-- FIO — вычисляемое поле, не заполняем.
SET IDENTITY_INSERT dbo.Persons ON;
INSERT INTO dbo.Persons
    (Id, Lastname, Firstname, MiddleName, PositionID, DepartmentID, PlaceID, Place,
     PhoneInternal, Phone, Email, Status, NotificationType, CreateDate, IsSystemPerson, NoSync, IsDirector, StartDate)
VALUES
    (1, N'Ержанов',      N'Нурсултан', N'Ерболович',  1, 1, 1, N'312', N'22-15', N'+7 701 000 00 01', N'n.erzhanov@example.kz',  1, 1, GETDATE(), 0, 0, 0, GETDATE()),
    (2, N'Абдрахманова', N'Айгуль',    N'Сериковна',  2, 2, 1, N'204', N'22-40', N'+7 701 000 00 02', N'a.abdrakhmanova@example.kz', 1, 1, GETDATE(), 0, 0, 0, GETDATE()),
    (3, N'Тлеубаев',     N'Данияр',    N'Маратович',  3, 3, 2, N'115', N'23-08', N'+7 701 000 00 03', N'd.tleubayev@example.kz',  1, 1, GETDATE(), 0, 0, 0, GETDATE()),
    (4, N'Смагулова',    N'Динара',    N'Азаматовна', 4, 4, 1, N'101', N'22-01', N'+7 701 000 00 04', N'd.smagulova@example.kz',  1, 1, GETDATE(), 0, 0, 0, GETDATE()),
    (5, N'Ким',          N'Сергей',    N'Владимирович', 5, 5, 3, N'501', N'20-00', N'+7 701 000 00 05', N's.kim@example.kz',      1, 1, GETDATE(), 0, 0, 1, GETDATE()),
    (6, N'Нурланов',     N'Асхат',     N'Бауыржанович', 6, 6, 2, N'220', N'23-55', N'+7 701 000 00 06', N'a.nurlanov@example.kz', 1, 1, GETDATE(), 0, 0, 0, GETDATE());
SET IDENTITY_INSERT dbo.Persons OFF;

-- ─── Роли ────────────────────────────────────────────────────────────────────
-- Id не identity. RoleID = 4 — роль, которую BpDazApp выдавал новым пользователям
-- бюро пропусков (PostAddPerson), поэтому она обязана существовать.
INSERT INTO dbo.Roles (Id, Title, Description, IsSystemRole)
VALUES
    (1, N'Администратор', N'Полный доступ',            1),
    (4, N'Пользователь',  N'Пользователь бюро пропусков', 1);

-- ─── Пользователи системы ────────────────────────────────────────────────────
SET IDENTITY_INSERT dbo.Users ON;
INSERT INTO dbo.Users (Id, Login, Password, PersonID, Status, LastPasswordUpdate, EnterAfterExpires, isBinding, isAllowNTAutologon, UserType, IsVCAllowed, IsSDAllowed)
VALUES
    (1, N'erzhanov',    N'', 1, 1, GETDATE(), 0, 0, 0, 0, 1, 0),
    (2, N'abdrakhmanova', N'', 2, 1, GETDATE(), 0, 0, 0, 0, 1, 0);
SET IDENTITY_INSERT dbo.Users OFF;

SET IDENTITY_INSERT dbo.Users2 ON;
INSERT INTO dbo.Users2 (Id, UserId, AccountName, IsAdmin)
VALUES
    (1, 1, N'DEV\erzhanov', 1),
    (2, 2, N'DEV\abdrakhmanova', 0);
SET IDENTITY_INSERT dbo.Users2 OFF;

INSERT INTO dbo.UserRoles (UserID, RoleID) VALUES (1, 1), (2, 4);

-- ─── Чёрный список ───────────────────────────────────────────────────────────
INSERT INTO dbo.BlackListVisitors (LastName, FirstName, MiddleName, IIN, CreatedDate, UserId, DeletedDate)
VALUES
    (N'Сериков',  N'Бауыржан', N'Маратович',  N'830417300999', DATEADD(day,-40,GETDATE()), 1, NULL),
    (N'Волков',   N'Игорь',    N'Петрович',   N'790822300444', DATEADD(day,-15,GETDATE()), 1, NULL),
    (N'Досжанов', N'Ерлан',    NULL,          N'900101300555', DATEADD(day,-60,GETDATE()), 1, DATEADD(day,-5,GETDATE()));

-- ─── Посетители ──────────────────────────────────────────────────────────────
SET IDENTITY_INSERT dbo.Visitors ON;
INSERT INTO dbo.Visitors
    (Id, LastName, Firstname, MiddleName, IIN, Firm, MobilePhone, Birthdate,
     HasMiddlename, IsAutoGuest, IsAlien, CreateDate, Status, TypeId)
VALUES
    (1, N'Оспанов',    N'Ерлан',  N'Кайратович',  N'870514300123', N'ТОО «Астана Групп»',        N'+7 701 234 56 78', '1987-05-14', 1, 0, 0, GETDATE(), 1, 0),
    (2, N'Жумабекова', N'Асем',   N'Талгатовна',  N'920211450987', N'АО «Казпочта»',             N'+7 702 345 67 89', '1992-02-11', 1, 0, 0, GETDATE(), 1, 0),
    (3, N'Петров',     N'Андрей', N'Николаевич',  N'781130300456', N'ТОО «СтройСервис»',         N'+7 705 456 78 90', '1978-11-30', 1, 0, 0, GETDATE(), 1, 0),
    (4, N'Ахметов',    N'Мади',   NULL,           N'950623400321', N'ИП Ахметов',                N'+7 707 567 89 01', '1995-06-23', 0, 0, 0, GETDATE(), 1, 0),
    (5, N'Сидорова',   N'Елена',  N'Викторовна',  N'880305350654', N'ТОО «Медиа Плюс»',          N'+7 708 678 90 12', '1988-03-05', 1, 0, 0, GETDATE(), 1, 0),
    (6, N'Байжанов',   N'Алихан', N'Русланович',  N'011218650777', N'Университет им. Гумилёва',  N'+7 747 789 01 23', '2001-12-18', 1, 0, 0, GETDATE(), 1, 0),
    (7, N'Ибрагимов',  N'Тимур',  N'Ержанович',   N'760909300888', N'ТОО «Логистик KZ»',         N'+7 777 890 12 34', '1976-09-09', 1, 0, 0, GETDATE(), 1, 0);
SET IDENTITY_INSERT dbo.Visitors OFF;

-- ─── Заявки ──────────────────────────────────────────────────────────────────
-- Состояние заявки считается из VisitsToEnd и строк Visits — см. RequestService.
DECLARE @today datetime = CAST(CAST(GETDATE() AS date) AS datetime);

SET IDENTITY_INSERT dbo.Requests ON;
INSERT INTO dbo.Requests
    (Id, Date, DateFrom, DateTo, NumOfVisits, HostCompanyID, HostDepartmentID, HostPersonID,
     MakerID, SignerID, InitDepartmentID, VisitorID, VisitsToEnd, PlaceID, Place, Objective,
     SignDate, Decision, StayCar, MoveDirection, IsRegistration, RequestType, HostPhone, LastUpdateDate)
VALUES
    -- отработанные визиты
    (1001, DATEADD(day,-13,@today), DATEADD(hour,10,DATEADD(day,-12,@today)), DATEADD(hour,12,DATEADD(day,-12,@today)), 1, 1, 2, 2, 1, 1, 2, 1, 0, 1, N'204', N'Совещание по договору',   DATEADD(day,-13,@today), 1, 0, 0, 0, 1, N'22-40', GETDATE()),
    (1002, DATEADD(day,-11,@today), DATEADD(hour, 9,DATEADD(day,-10,@today)), DATEADD(hour,11,DATEADD(day,-10,@today)), 1, 1, 3, 3, 3, 3, 3, 3, 0, 2, N'115', N'Сверка документов',       DATEADD(day,-11,@today), 1, 0, 0, 0, 1, N'23-08', GETDATE()),
    (1003, DATEADD(day, -9,@today), DATEADD(hour,14,DATEADD(day, -8,@today)), DATEADD(hour,15,DATEADD(day, -8,@today)), 1, 1, 4, 4, 1, 1, 4, 5, 0, 1, N'101', N'Передача корреспонденции', DATEADD(day,-9,@today), 1, 0, 0, 0, 1, N'22-01', GETDATE()),
    (1004, DATEADD(day, -7,@today), DATEADD(hour,11,DATEADD(day, -6,@today)), DATEADD(hour,13,DATEADD(day, -6,@today)), 1, 1, 2, 2, 2, 2, 2, 2, 0, 1, N'204', N'Собеседование',           DATEADD(day,-7,@today), 1, 0, 0, 0, 1, N'22-40', GETDATE()),
    (1005, DATEADD(day, -6,@today), DATEADD(hour, 8,DATEADD(day, -5,@today)), DATEADD(hour,10,DATEADD(day, -5,@today)), 1, 1, 6, 6, 6, 6, 6, 7, 0, 2, N'220', N'Поставка оборудования',   DATEADD(day,-6,@today), 1, 0, 0, 0, 1, N'23-55', GETDATE()),
    (1006, DATEADD(day, -5,@today), DATEADD(hour,15,DATEADD(day, -4,@today)), DATEADD(hour,16,DATEADD(day, -4,@today)), 1, 1, 5, 5, 1, 1, 5, 4, 0, 3, N'501', N'Приём у заместителя директора', DATEADD(day,-5,@today), 1, 0, 0, 0, 1, N'20-00', GETDATE()),
    (1007, DATEADD(day, -4,@today), DATEADD(hour, 9,DATEADD(day, -3,@today)), DATEADD(hour,18,DATEADD(day, -3,@today)), 1, 1, 1, 1, 1, 1, 1, 6, 0, 1, N'312', N'Практика студентов',      DATEADD(day,-4,@today), 1, 0, 0, 0, 1, N'22-15', GETDATE()),

    -- просроченные: время вышло, посетитель не пришёл
    (1008, DATEADD(day, -8,@today), DATEADD(hour,13,DATEADD(day, -7,@today)), DATEADD(hour,15,DATEADD(day, -7,@today)), 1, 1, 1, 1, 1, 1, 1, 6, 1, 1, N'312', N'Консультация по проекту',  DATEADD(day,-8,@today), 1, 0, 0, 0, 1, N'22-15', GETDATE()),
    (1009, DATEADD(day, -3,@today), DATEADD(hour,10,DATEADD(day, -2,@today)), DATEADD(hour,11,DATEADD(day, -2,@today)), 1, 1, 4, 4, 4, 4, 4, 3, 1, 1, N'101', N'Подписание акта',          DATEADD(day,-3,@today), 1, 0, 0, 0, 1, N'22-01', GETDATE()),

    -- сейчас в здании
    (1010, DATEADD(day, -1,@today), DATEADD(hour, 9,@today), DATEADD(hour,18,@today), 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, N'312', N'Демонстрация системы', DATEADD(day,-1,@today), 1, 0, 0, 0, 1, N'22-15', GETDATE()),
    (1011, DATEADD(day, -1,@today), DATEADD(hour,10,@today), DATEADD(hour,17,@today), 1, 1, 3, 3, 3, 3, 3, 7, 0, 2, N'115', N'Приёмка работ',        DATEADD(day,-1,@today), 1, 0, 0, 0, 1, N'23-08', GETDATE()),

    -- карта получена, вход ещё не зафиксирован
    (1012, DATEADD(day, -1,@today), DATEADD(hour, 8,@today), DATEADD(hour,17,@today), 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, N'204', N'Оформление документов', DATEADD(day,-1,@today), 1, 0, 0, 0, 1, N'22-40', GETDATE()),

    -- оформленные на будущее
    (1013, @today, DATEADD(hour,11,DATEADD(day, 1,@today)), DATEADD(hour,12,DATEADD(day, 1,@today)), 1, 1, 5, 5, 1, 1, 5, 4, 1, 3, N'501', N'Плановая встреча',          @today, 1, 0, 0, 0, 1, N'20-00', GETDATE()),
    (1014, @today, DATEADD(hour, 9,DATEADD(day, 2,@today)), DATEADD(hour,13,DATEADD(day, 2,@today)), 1, 1, 6, 6, 6, 6, 6, 5, 1, 2, N'220', N'Аудит инженерных систем',  @today, 1, 0, 0, 0, 1, N'23-55', GETDATE()),
    (1015, @today, DATEADD(hour,14,DATEADD(day, 3,@today)), DATEADD(hour,16,DATEADD(day, 3,@today)), 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, N'312', N'Настройка интеграции',     @today, 1, 0, 0, 0, 1, N'22-15', GETDATE());
SET IDENTITY_INSERT dbo.Requests OFF;

-- ─── Визиты ──────────────────────────────────────────────────────────────────
INSERT INTO dbo.Visits (RequestID, VisitorDateIn, DateExit, CardReadableNum, ValidFrom, ValidTo, CreateDate, VisitType)
SELECT r.Id,
       DATEADD(minute, v.EnterOffset, r.DateFrom),
       CASE WHEN v.ExitOffset IS NULL THEN NULL ELSE DATEADD(minute, v.ExitOffset, r.DateFrom) END,
       v.CardNum,
       r.DateFrom, r.DateTo, GETDATE(), 0
FROM dbo.Requests r
JOIN (VALUES
        (1001,   5,  100, N'0010000001'),
        (1002, -10,   95, N'0010000002'),
        (1003,  12,   55, N'0010000003'),
        (1004,   3,  110, N'0010000004'),
        (1005,   0,   80, N'0010000005'),
        (1006,  20,   50, N'0010000006'),
        (1007,   5,  470, N'0010000007'),
        (1010, -15, NULL, N'0010000010'),
        (1011,  25, NULL, N'0010000011')
     ) AS v(RequestId, EnterOffset, ExitOffset, CardNum) ON v.RequestId = r.Id;

-- карта выдана, входа ещё нет
INSERT INTO dbo.Visits (RequestID, VisitorDateIn, DateExit, CardReadableNum, ValidFrom, ValidTo, CreateDate, VisitType)
SELECT r.Id, NULL, NULL, N'0010000012', r.DateFrom, r.DateTo, GETDATE(), 0
FROM dbo.Requests r WHERE r.Id = 1012;

COMMIT TRANSACTION;

SELECT
    (SELECT COUNT(*) FROM dbo.Persons)  AS persons,
    (SELECT COUNT(*) FROM dbo.Users)    AS users,
    (SELECT COUNT(*) FROM dbo.Visitors) AS visitors,
    (SELECT COUNT(*) FROM dbo.Requests) AS requests,
    (SELECT COUNT(*) FROM dbo.Visits)   AS visits,
    (SELECT COUNT(*) FROM dbo.BlackListVisitors WHERE DeletedDate IS NULL) AS blacklist;
