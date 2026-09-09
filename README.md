# BpDazApp (React)

Переписанный «Бюро пропусков» (BpDazApp, ASP.NET MVC 5 + Kendo UI) на ASP.NET Core Web API
(.NET 10) и React 19 / TypeScript. Дизайн и структура кода повторяют проект PassBureau.

## Структура

```
BpDazApp.slnx              решение .NET
db/migrations/             доработки схемы поверх DazDbScript.sql
db/seed-demo.sql           демоданные для локальной разработки
server/BpDaz.Api/          Web API (controllers)
  Controllers/             HTTP-эндпоинты
  Data/                    DbContext VcEntities и сущности (scaffold из БД)
  Dto/                     контракты с фронтендом
  Services/                прикладная логика
  Infrastructure/          текущий пользователь
client/                    Vite + React + TypeScript
  src/app/                 fetch-хелпер api(), клиенты API, i18n
  src/layouts/             сайдбар, breadcrumbs, футер, переключатель языка
  src/locales/             ru / kk / en
  src/pages/               страницы
```

Фронтенд собран на том же стеке, что и PassBureau: MUI Material + MUI Joy, react-router-dom,
i18next, обычный `fetch` через общий хелпер `api()` (без TanStack Query и axios).

## Требования

- .NET SDK 10.0
- Node.js 22+
- SQL Server с базой `VisitorControl73`

## База данных

Схема разворачивается из `DazDbScript.sql` (выгрузка структуры боевой базы, без данных):

```bash
sqlcmd -S localhost -U sa -P <пароль> -C -d master -Q "CREATE DATABASE [VisitorControl73];"
sqlcmd -S localhost -U sa -P <пароль> -C -d VisitorControl73 -i DazDbScript.sql
```

Скрипт содержит четыре CLR-сборки, поэтому до его запуска нужен `clr enabled = 1`;
иначе не создадутся ~40 функций и зависимые представления.

Затем миграции из `db/migrations` по возрастанию номера — они идемпотентны:

```bash
cd db/migrations
sqlcmd -S localhost -U sa -P <пароль> -C -d VisitorControl73 -f 65001 -i 001-users2-password.sql
```

Дальше — демоданные (справочники, 6 сотрудников, 7 посетителей, 15 заявок во всех
состояниях). Скрипт очищает заполняемые таблицы, так что запускать его можно повторно:

```bash
cd db
sqlcmd -S localhost -U sa -P <пароль> -C -d VisitorControl73 -f 65001 -i seed-demo.sql
```

Флаг `-f 65001` обязателен — файл в UTF-8, без него sqlcmd запишет кириллицу мусором.

Строка подключения лежит в `appsettings.Development.json` (ключ `ConnectionStrings:Default`).

### Пересоздать сущности после изменения схемы

```bash
cd server/BpDaz.Api
dotnet ef dbcontext scaffold "<строка подключения>" Microsoft.EntityFrameworkCore.SqlServer \
  --context VcEntities --context-dir Data --output-dir Data/Entities --no-onconfiguring --force \
  --table dbo.Requests --table dbo.Visitors --table dbo.Persons --table dbo.Users --table dbo.Users2 \
  --table dbo.Visits --table dbo.Places --table dbo.Departments --table dbo.Companies \
  --table dbo.Positions --table dbo.RequestDeleteInfo
```

В модель берётся только рабочий срез таблиц, а не вся база (198 таблиц).

## Запуск через F5 (VS Code)

В панели Run and Debug выбрать **BpDaz Full Stack (F5)** и нажать F5 — соберётся API,
поднимется Vite, а затем автоматически откроется Chrome на `http://localhost:5173`.

| Конфигурация | Что делает |
| --- | --- |
| `BpDaz.Api (C#)` | сборка + запуск API с отладчиком на `http://localhost:5087` и `https://localhost:7211` |
| `BpDaz.Web (Vite server)` | `npm run dev` в `client/` на порту 5173, затем запускает Chrome-конфигурацию |
| `BpDaz.Web (Chrome)` | отладка фронтенда в Chrome |

## Запуск из терминала

```bash
dotnet run --project server/BpDaz.Api --launch-profile http   # :5087

cd client
npm install   # только при первом запуске
npm run dev   # :5173
```

Vite проксирует `/api/*` на `http://localhost:5087`, поэтому CORS в разработке не требуется.

## Что перенесено из BpDazApp

**Заявки на посетителей**

- список — все и «мои», вкладки **все / в здании / покинувшие**, фильтр по датам,
  поиск по загруженной странице;
- статусы заявки (оформлен, действующий, просрочен, отработано, карта получена) считаются
  по той же логике, что `RepRequest.GetRequestState` в BpDazApp;
- создание: данные посетителя, принимающий с поиском по ФИО (здание, кабинет и
  внутренний телефон подставляются из карточки сотрудника), период визита, цель;
- карточка заявки и мягкое удаление через `RequestDeleteInfo`.

**Справочники** (видны только администратору, как в `_SideNav.cshtml`)

- сотрудники: список с поиском, добавление; при отметке «Пользователь бюро пропусков»
  вместе с `Persons` создаются `Users`, `Users2` и роль в `UserRoles` — как в `PostAddPerson`;
- пользователи: список и редактирование ФИО, логина, доменной учётки, признака админа;
  занятый логин и занятая AD-учётка возвращают 409 с понятным текстом.

**Чёрный список**

- список с поиском, добавление, мягкое удаление (`DeletedDate`);
- при создании заявки ИИН проверяется по чёрному списку, и заявка отклоняется с 409 —
  как проверка в `PostRequest`.

Локализация ru / kk / en вместо `.resx`.

## Полезное

| Что | Где |
| --- | --- |
| OpenAPI-документ | `http://localhost:5087/openapi/v1.json` (только Development) |
| Health check | `http://localhost:5087/health` |
| Примеры запросов | `server/BpDaz.Api/BpDaz.Api.http` |

## Сборка

```bash
dotnet build BpDazApp.slnx
cd client && npm run build
```

## Дальнейшие шаги

- **Аутентификации нет.** Текущий пользователь — заглушка `StubCurrentUser`; при подключении
  Negotiate/JWT (как в PassBureau) меняется только регистрация `ICurrentUser` в `Program.cs`.
- **Смена пароля пользователя не сделана**, хотя колонки под неё уже есть: миграция
  `001-users2-password.sql` добавляет `Users2.PasswordHash` и `Users2.PasswordUpdatedDate`
  (в выгрузке `DazDbScript.sql` их нет, а `RepAuth` в BpDazApp их использует). Поля
  «Новый пароль» в карточке пользователя пока нет — оно появится вместе с входом по
  логину и паролю, когда будет выбран алгоритм хеширования.
- Не перенесены: поиск по ИИН в ГБДФЛ и экспорт отчётов.
