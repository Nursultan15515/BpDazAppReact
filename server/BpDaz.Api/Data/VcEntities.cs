using System;
using System.Collections.Generic;
using BpDaz.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace BpDaz.Api.Data;

public partial class VcEntities : DbContext
{
    public VcEntities(DbContextOptions<VcEntities> options)
        : base(options)
    {
    }

    public virtual DbSet<BlackListVisitor> BlackListVisitors { get; set; }

    public virtual DbSet<Company> Companies { get; set; }

    public virtual DbSet<Department> Departments { get; set; }

    public virtual DbSet<Person> Persons { get; set; }

    public virtual DbSet<Place> Places { get; set; }

    public virtual DbSet<Position> Positions { get; set; }

    public virtual DbSet<Request> Requests { get; set; }

    public virtual DbSet<RequestDeleteInfo> RequestDeleteInfos { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    public virtual DbSet<Users2> Users2s { get; set; }

    public virtual DbSet<Visit> Visits { get; set; }

    public virtual DbSet<Visitor> Visitors { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BlackListVisitor>(entity =>
        {
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.DeletedDate).HasColumnType("datetime");
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.Iin)
                .HasMaxLength(12)
                .HasColumnName("IIN");
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.MiddleName).HasMaxLength(50);
        });

        modelBuilder.Entity<Company>(entity =>
        {
            entity.HasKey(e => e.Id)
                .HasName("PK_Company")
                .HasFillFactor(90);

            entity.Property(e => e.Id).HasComment("Уникальный код записи");
            entity.Property(e => e.CompanyCreateDate)
                .HasDefaultValueSql("(getdate())", "DF_Companies_CompanyCreateDate")
                .HasColumnType("datetime");
            entity.Property(e => e.CompanyObjectId)
                .HasMaxLength(50)
                .HasComment("ИД объекта в интегрирующейся системе")
                .HasColumnName("CompanyObjectID");
            entity.Property(e => e.CompanyStatus)
                .HasComment("Статус: 0- удален")
                .HasDefaultValue((byte)1, "DF_Companies_CompanyStatus");
            entity.Property(e => e.Email).HasMaxLength(50);
            entity.Property(e => e.ForeignName)
                .HasMaxLength(2000)
                .HasComment("Иностранное наименование комании");
            entity.Property(e => e.Fullname)
                .HasMaxLength(2000)
                .HasComment("Полное имя");
            entity.Property(e => e.NoSync)
                .HasComment("Не производить синхронизацию")
                .HasDefaultValue((byte)0, "DF_Companies_NoSync");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasComment("Название");
        });

        modelBuilder.Entity<Department>(entity =>
        {
            entity.Property(e => e.Id).HasComment("Уникальный код записи");
            entity.Property(e => e.Code)
                .HasMaxLength(50)
                .HasComment("Код");
            entity.Property(e => e.CompanyId)
                .HasComment("Код компании")
                .HasColumnName("CompanyID");
            entity.Property(e => e.DepartmentCreateDate)
                .HasDefaultValueSql("(getdate())", "DF_Departments_DepartmentCreateDate")
                .HasColumnType("datetime");
            entity.Property(e => e.DepartmentObjectId)
                .HasMaxLength(500)
                .HasColumnName("DepartmentObjectID");
            entity.Property(e => e.Email).HasMaxLength(50);
            entity.Property(e => e.Fullname)
                .HasMaxLength(8000)
                .IsUnicode(false)
                .HasComment("Полное имя");
            entity.Property(e => e.NoSync).HasComment("Не производить синхронизацию");
            entity.Property(e => e.ParentId)
                .HasComment("Код родителя")
                .HasColumnName("ParentID");
            entity.Property(e => e.Status)
                .HasComment("Статус (активен/неактивен)")
                .HasDefaultValue((byte)1, "DF_Departments_Status");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasComment("Название");

            entity.HasOne(d => d.Company).WithMany(p => p.Departments)
                .HasForeignKey(d => d.CompanyId)
                .HasConstraintName("FK_Departments_Companies");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent)
                .HasForeignKey(d => d.ParentId)
                .HasConstraintName("FK_Departments_Departments");
        });

        modelBuilder.Entity<Person>(entity =>
        {
            entity.HasKey(e => e.Id).HasFillFactor(90);

            entity.Property(e => e.Id).HasComment("Уникальный код записи");
            entity.Property(e => e.BossKadrovikId)
                .HasComment("Код в системе \"Босс-Кадровик\"")
                .HasColumnName("BossKadrovikID");
            entity.Property(e => e.CreateDate)
                .HasComment("Дата создания записи")
                .HasDefaultValueSql("(getdate())", "DF_Persons_CreateDate")
                .HasColumnType("datetime");
            entity.Property(e => e.DepartmentId)
                .HasComment("Код подразделения текущего пользователя")
                .HasColumnName("DepartmentID");
            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .HasComment("E-мейл");
            entity.Property(e => e.FinishDate).HasColumnType("datetime");
            entity.Property(e => e.Fio)
                .HasMaxLength(55)
                .HasComputedColumnSql("(([Lastname]+isnull(' '+(left([Firstname],(1))+'.'),''))+isnull(left([MiddleName],(1))+'.',''))", false)
                .HasColumnName("FIO");
            entity.Property(e => e.Firstname)
                .HasMaxLength(50)
                .HasComment("Имя");
            entity.Property(e => e.HasPermanentPaper)
                .HasComment("Флаг наличия постоянного пропуска")
                .HasDefaultValue((byte)1, "DF_Persons_hasPermanentPaper")
                .HasColumnName("hasPermanentPaper");
            entity.Property(e => e.HomePhone)
                .HasMaxLength(50)
                .HasComment("Домашний телефон");
            entity.Property(e => e.IsSystemPerson).HasComment("Специальный сотрудник для системного использования");
            entity.Property(e => e.Lastname)
                .HasMaxLength(50)
                .HasComment("Фамилия");
            entity.Property(e => e.MiddleName)
                .HasMaxLength(50)
                .HasComment("Отчество");
            entity.Property(e => e.NoSync).HasComment("Не производить синхронизацию=1");
            entity.Property(e => e.NotificationType)
                .HasComment("Тип уведомления")
                .HasDefaultValue((byte)2, "DF_Persons_NotificationType");
            entity.Property(e => e.OldId).HasComment("Id предка данной сущности (существовавшей до изменения сотрудника)");
            entity.Property(e => e.OwnerId)
                .HasComment("Код, выбранного параметра")
                .HasColumnName("OwnerID");
            entity.Property(e => e.PermanentPaperNumber)
                .HasMaxLength(50)
                .HasComment("Номер постоянного пропуска");
            entity.Property(e => e.Phone)
                .HasMaxLength(50)
                .HasComment("Телефон");
            entity.Property(e => e.PhoneInternal)
                .HasMaxLength(50)
                .HasComment("Телефон внутренний");
            entity.Property(e => e.Place)
                .HasMaxLength(255)
                .HasComment("Место");
            entity.Property(e => e.PlaceId)
                .HasComment("Код здания")
                .HasDefaultValue(1, "DF_Persons_PlaceID")
                .HasColumnName("PlaceID");
            entity.Property(e => e.PositionId)
                .HasComment("Код должности")
                .HasColumnName("PositionID");
            entity.Property(e => e.RegNumber).HasMaxLength(20);
            entity.Property(e => e.StartDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasComment("Статус (активен/неактивен)")
                .HasDefaultValue((byte)1, "DF_Persons_Status");

            entity.HasOne(d => d.Department).WithMany(p => p.People)
                .HasForeignKey(d => d.DepartmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Persons_Departments");

            entity.HasOne(d => d.PlaceNavigation).WithMany(p => p.People)
                .HasForeignKey(d => d.PlaceId)
                .HasConstraintName("FK_Persons_Places");

            entity.HasOne(d => d.Position).WithMany(p => p.People)
                .HasForeignKey(d => d.PositionId)
                .HasConstraintName("FK_Persons_Positions");
        });

        modelBuilder.Entity<Place>(entity =>
        {
            entity.HasKey(e => e.Id).HasFillFactor(90);

            entity.Property(e => e.Id).HasComment("Уникальный код записи");
            entity.Property(e => e.Code).HasMaxLength(450);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.ParentId).HasColumnName("ParentID");
            entity.Property(e => e.PlaceCreateDate)
                .HasComment("Дата создания записи")
                .HasDefaultValueSql("(getdate())", "DF_Places_PlaceCreateDate")
                .HasColumnType("datetime");
            entity.Property(e => e.PlaceTypeId).HasColumnName("PlaceTypeID");
            entity.Property(e => e.Title)
                .HasMaxLength(2000)
                .HasComment("Название");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent)
                .HasForeignKey(d => d.ParentId)
                .HasConstraintName("FK_Places_Places");
        });

        modelBuilder.Entity<Position>(entity =>
        {
            entity.Property(e => e.Id).HasComment("Уникальный код записи");
            entity.Property(e => e.BossKadrovikId)
                .HasComment("Код в системе \"Босс-Кадровик\"")
                .HasColumnName("BossKadrovikID");
            entity.Property(e => e.PositionCompanyId).HasColumnName("PositionCompanyID");
            entity.Property(e => e.Status).HasDefaultValue(true);
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasComment("Название");
        });

        modelBuilder.Entity<Request>(entity =>
        {
            entity.Property(e => e.Id).HasComment("Уникальный код записи");
            entity.Property(e => e.CancelDate)
                .HasComment("Дата отмены (отзыва)")
                .HasColumnType("datetime");
            entity.Property(e => e.CancelerId)
                .HasComment("Код сотрудника, отозвавшего заявку")
                .HasColumnName("CancelerID");
            entity.Property(e => e.Date)
                .HasComment("Дата записи")
                .HasDefaultValueSql("(getdate())", "DF_Requests_Date")
                .HasColumnType("datetime");
            entity.Property(e => e.DateFrom)
                .HasComment("Дата с")
                .HasDefaultValueSql("(getdate())", "DF_Requests_DateFrom")
                .HasColumnType("datetime");
            entity.Property(e => e.DateTo)
                .HasComment("Дата по")
                .HasDefaultValueSql("(getdate())", "DF_Requests_DateTo")
                .HasColumnType("datetime");
            entity.Property(e => e.Decision).HasComment("Код принятого решения");
            entity.Property(e => e.ForSignerId)
                .HasComment("Код сотрудника, кому было выслано для согласования")
                .HasColumnName("ForSignerID");
            entity.Property(e => e.HostCompanyId)
                .HasComment("Код принимающей компании")
                .HasColumnName("HostCompanyID");
            entity.Property(e => e.HostDepartmentId)
                .HasComment("Код принимающего подразделения")
                .HasColumnName("HostDepartmentID");
            entity.Property(e => e.HostPersonId)
                .HasComment("Код принимающего сотрудника")
                .HasColumnName("HostPersonID");
            entity.Property(e => e.HostPhone)
                .HasMaxLength(50)
                .HasComment("Телефон принимающей стороны");
            entity.Property(e => e.InitDepartmentId)
                .HasComment("Подразделение-инициатор")
                .HasColumnName("InitDepartmentID");
            entity.Property(e => e.IsRegistration).HasComment("Заявка фиктивная = 1");
            entity.Property(e => e.LastUpdateDate)
                .HasComment("Время последнего обновления информации")
                .HasDefaultValueSql("(getdate())", "DF_Requests_LastUpdateDate")
                .HasColumnType("datetime");
            entity.Property(e => e.MakerId)
                .HasComment("Код пользователя автора заявки")
                .HasColumnName("MakerID");
            entity.Property(e => e.Notes)
                .HasMaxLength(2000)
                .HasComment("Доп. информация (ноутбук и пр.)");
            entity.Property(e => e.NumOfVisits).HasComment("Максимально допустимое количество визитов");
            entity.Property(e => e.Objective)
                .HasMaxLength(2000)
                .HasComment("Цель последнего посещения посетителя");
            entity.Property(e => e.PinId).HasColumnName("PinID");
            entity.Property(e => e.Place)
                .HasMaxLength(255)
                .HasComment("Место");
            entity.Property(e => e.PlaceId)
                .HasComment("Код здания")
                .HasDefaultValue(0, "DF_Requests_PlaceID")
                .HasColumnName("PlaceID");
            entity.Property(e => e.RequestNotes)
                .HasMaxLength(2000)
                .HasComment("Заметки операторов по заявке");
            entity.Property(e => e.RequestType).HasDefaultValue(1, "DF_Requests_RequestType");
            entity.Property(e => e.Resolution)
                .HasMaxLength(2000)
                .HasComment("Резолюция");
            entity.Property(e => e.SignDate)
                .HasComment("Дата и время подписания")
                .HasColumnType("datetime");
            entity.Property(e => e.SignerId)
                .HasComment("Код пользователя  подписавшего заявку")
                .HasColumnName("SignerID");
            entity.Property(e => e.StayCar)
                .HasComment("1- Оставить машину на ночь")
                .HasDefaultValue(false, "DF_Requests_StayCar");
            entity.Property(e => e.VisitorCarId)
                .HasComment("Код машины посетителя")
                .HasColumnName("VisitorCarID");
            entity.Property(e => e.VisitorDocumentId)
                .HasComment("Код документа посетителя")
                .HasColumnName("VisitorDocumentID");
            entity.Property(e => e.VisitorId)
                .HasComment("Код посетителя")
                .HasColumnName("VisitorID");
            entity.Property(e => e.VisitsToEnd)
                .HasComment("Количество оставшихся допустимых визитов по заявке")
                .HasDefaultValue(3, "DF_Requests_VisitsToEnd");

            entity.HasOne(d => d.Canceler).WithMany(p => p.RequestCancelers)
                .HasForeignKey(d => d.CancelerId)
                .HasConstraintName("FK_Requests_Persons2");

            entity.HasOne(d => d.HostCompany).WithMany(p => p.Requests)
                .HasForeignKey(d => d.HostCompanyId)
                .HasConstraintName("FK_Requests_Companies");

            entity.HasOne(d => d.HostDepartment).WithMany(p => p.RequestHostDepartments)
                .HasForeignKey(d => d.HostDepartmentId)
                .HasConstraintName("FK_Requests_Departments1");

            entity.HasOne(d => d.HostPerson).WithMany(p => p.RequestHostPeople)
                .HasForeignKey(d => d.HostPersonId)
                .HasConstraintName("FK_Requests_Persons1");

            entity.HasOne(d => d.InitDepartment).WithMany(p => p.RequestInitDepartments)
                .HasForeignKey(d => d.InitDepartmentId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_Requests_Departments");

            entity.HasOne(d => d.Maker).WithMany(p => p.RequestMakers)
                .HasForeignKey(d => d.MakerId)
                .HasConstraintName("FK_Requests_Persons");

            entity.HasOne(d => d.PlaceNavigation).WithMany(p => p.Requests)
                .HasForeignKey(d => d.PlaceId)
                .HasConstraintName("FK_Requests_Places");

            entity.HasOne(d => d.Signer).WithMany(p => p.RequestSigners)
                .HasForeignKey(d => d.SignerId)
                .HasConstraintName("FK_Requests_Persons3");

            entity.HasOne(d => d.Visitor).WithMany(p => p.Requests)
                .HasForeignKey(d => d.VisitorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Requests_Visitors");
        });

        modelBuilder.Entity<RequestDeleteInfo>(entity =>
        {
            entity.ToTable("RequestDeleteInfo");

            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id)
                .HasName("PK_Groups")
                .IsClustered(false)
                .HasFillFactor(90);

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasComment("Уникальный код записи");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasComment("Описание");
            entity.Property(e => e.Title)
                .HasMaxLength(450)
                .HasComment("Название");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasFillFactor(90);

            entity.Property(e => e.Id).HasComment("Уникальный код записи");
            entity.Property(e => e.BanReason).HasComment("Причина бана (постоянной блокировки) пользователя");
            entity.Property(e => e.ClientInfoMobile)
                .HasMaxLength(100)
                .HasComment("Данные о привязке к мобильному");
            entity.Property(e => e.ClientInfoPc)
                .HasMaxLength(100)
                .HasComment("Данные о привязке к ПК")
                .HasColumnName("ClientInfoPC");
            entity.Property(e => e.ComputerName)
                .HasMaxLength(50)
                .HasComment("Имя компьютера");
            entity.Property(e => e.EnterAfterExpires)
                .HasComment("Число входов в систему после истечения пароля")
                .HasDefaultValue((byte)3, "DF_Users_EnterAfterExpires");
            entity.Property(e => e.Hash1).HasMaxLength(50);
            entity.Property(e => e.Hash2).HasMaxLength(50);
            entity.Property(e => e.Ipaddress)
                .HasMaxLength(50)
                .HasComment("Функция, возвращающая IP-адрес текущего пользователя")
                .HasColumnName("IPAddress");
            entity.Property(e => e.IsAllowNtautologon)
                .HasComment("Допустим ли вход по сетевому имени")
                .HasDefaultValue((byte)1, "DF_Users_isAllowNTAutologon")
                .HasColumnName("isAllowNTAutologon");
            entity.Property(e => e.IsBinding)
                .HasComment("Есть ли привязка к физическому рабочему месту")
                .HasColumnName("isBinding");
            entity.Property(e => e.IsSdallowed)
                .HasComment("Разрешение на использование функционала ServiceDesk")
                .HasColumnName("IsSDAllowed");
            entity.Property(e => e.IsVcallowed)
                .HasComment("Разрешение на использование функционала VisitorControl")
                .HasColumnName("IsVCAllowed");
            entity.Property(e => e.LastEditDate)
                .HasDefaultValueSql("(getdate())", "DF_Users_LastEditDate")
                .HasColumnType("datetime");
            entity.Property(e => e.LastLogonTime)
                .HasComment("Последнее время входа в систему")
                .HasColumnType("datetime");
            entity.Property(e => e.LastPasswordUpdate)
                .HasComment("Дата и время последнего изменения пароля")
                .HasDefaultValueSql("(getdate())", "DF_Users_LastPasswordUpdate")
                .HasColumnType("datetime");
            entity.Property(e => e.Login)
                .HasMaxLength(400)
                .HasComment("Логин");
            entity.Property(e => e.LogonUser)
                .HasMaxLength(400)
                .HasComment("Имя пользователя в сети");
            entity.Property(e => e.Macaddress)
                .HasMaxLength(50)
                .HasComment("MAC-адрес сетевой платы")
                .HasColumnName("MACAddress");
            entity.Property(e => e.Ntusername)
                .HasMaxLength(400)
                .HasComment("Сетевой логин пользователя")
                .HasColumnName("NTUsername");
            entity.Property(e => e.Password)
                .HasMaxLength(50)
                .HasComment("Пароль");
            entity.Property(e => e.PersonId)
                .HasComment("Код персоны")
                .HasColumnName("PersonID");
            entity.Property(e => e.StartDate)
                .HasComment("Дата начала полномочий")
                .HasDefaultValueSql("(getdate())", "DF_Users_CreateDate")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasComment("Статус (1 - активен, 0 - неактивен, 2 - забанен)")
                .HasDefaultValue((byte)1, "DF_Users_Status");
            entity.Property(e => e.UserType).HasComment("Тип: 0 - обычный, 1 - мобильный");

            entity.HasOne(d => d.Person).WithMany(p => p.Users)
                .HasForeignKey(d => d.PersonId)
                .HasConstraintName("FK_Users_Persons");
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.Id)
                .HasName("PK_UserRoles_Id")
                .IsClustered(false);

            entity.Property(e => e.BaseCompanyId)
                .HasComment("Код компании")
                .HasColumnName("BaseCompanyID");
            entity.Property(e => e.BaseDepartmentId)
                .HasComment("Код подразделения")
                .HasColumnName("BaseDepartmentID");
            entity.Property(e => e.BasePlaceId)
                .HasComment("Код места")
                .HasColumnName("BasePlaceID");
            entity.Property(e => e.RoleId)
                .HasComment("Код роли")
                .HasColumnName("RoleID");
            entity.Property(e => e.UserId)
                .HasComment("Код пользователя")
                .HasColumnName("UserID");

            entity.HasOne(d => d.BaseCompany).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.BaseCompanyId)
                .HasConstraintName("FK_UserRoles_Companies");

            entity.HasOne(d => d.BaseDepartment).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.BaseDepartmentId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_UserRoles_Departments");

            entity.HasOne(d => d.BasePlace).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.BasePlaceId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_UserRoles_Places");

            entity.HasOne(d => d.Role).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK_UserRoles_Roles");

            entity.HasOne(d => d.User).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_UserRoles_Users");
        });

        modelBuilder.Entity<Users2>(entity =>
        {
            entity.ToTable("Users2");

            entity.HasIndex(e => e.UserId, "UX_Users2_UserId").IsUnique();

            entity.Property(e => e.AccountName).HasMaxLength(1000);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.PasswordUpdatedDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<Visit>(entity =>
        {
            entity.Property(e => e.Id).HasComment("Уникальный код записи");
            entity.Property(e => e.CardReadableNum)
                .HasMaxLength(50)
                .HasComment("Читаемый номер карты доступа");
            entity.Property(e => e.CreateDate)
                .HasPrecision(0)
                .HasComment("Дата и время создания пропуска")
                .HasDefaultValueSql("(sysdatetime())", "DF_Visits_CreateDate");
            entity.Property(e => e.DateEnd)
                .HasComment("Дата окончания")
                .HasColumnType("datetime");
            entity.Property(e => e.DateExit)
                .HasComment("Дата и время выхода")
                .HasColumnType("datetime");
            entity.Property(e => e.DocumentFilesId)
                .HasMaxLength(32)
                .IsFixedLength()
                .HasComment("Фото посетителя на момент оформления")
                .HasColumnName("DocumentFilesID");
            entity.Property(e => e.IsAutoCheckout)
                .HasComment("Отметка о выходе проставлена автоматически")
                .HasDefaultValue(false, "DF_Visits_IsAutoCheckout");
            entity.Property(e => e.Notes)
                .HasMaxLength(2000)
                .HasComment("Замечания");
            entity.Property(e => e.PlaceId).HasColumnName("PlaceID");
            entity.Property(e => e.RequestId)
                .HasComment("Код заявки")
                .HasColumnName("RequestID");
            entity.Property(e => e.SignerId)
                .HasComment("Код пользователя  подписавшего заявку")
                .HasDefaultValue(0, "DF_Visits_SignerID")
                .HasColumnName("SignerID");
            entity.Property(e => e.StayCar)
                .HasComment("Машину разрешено оставить на ночь")
                .HasDefaultValue(false, "DF_Visits_StayCar");
            entity.Property(e => e.ValidFrom).HasComment("Дата и время начала периода действия Пропуска");
            entity.Property(e => e.ValidMinutesFrom).HasComment("Начало периода действия пропуска внутри суток, в минутах от начала суток");
            entity.Property(e => e.ValidMinutesTo).HasComment("Конец периода действия пропуска внутри суток, в минутах от начала суток");
            entity.Property(e => e.ValidTo).HasComment("Дата и время окончания периода действия Пропуска");
            entity.Property(e => e.VisitNumber).HasComment("Номер пропуска");
            entity.Property(e => e.VisitType)
                .HasComment("Тип пропуска")
                .HasDefaultValue(1, "DF_Visits_VisitType");
            entity.Property(e => e.VisitorCarId)
                .HasComment("Код машины посетителя")
                .HasColumnName("VisitorCarID");
            entity.Property(e => e.VisitorDateIn)
                .HasComment("Дата/время прохода посетителя через турникет")
                .HasColumnType("datetime");
            entity.Property(e => e.VisitorDocumentId)
                .HasComment("Код документа посетителя")
                .HasColumnName("VisitorDocumentID");

            entity.HasOne(d => d.Place).WithMany(p => p.Visits)
                .HasForeignKey(d => d.PlaceId)
                .HasConstraintName("FK_Visits_Places");

            entity.HasOne(d => d.Request).WithMany(p => p.Visits)
                .HasForeignKey(d => d.RequestId)
                .HasConstraintName("FK_Visits_Requests");
        });

        modelBuilder.Entity<Visitor>(entity =>
        {
            entity.HasKey(e => e.Id).IsClustered(false);

            entity.Property(e => e.Id).HasComment("Уникальный код записи");
            entity.Property(e => e.Address)
                .HasMaxLength(100)
                .HasComment("E-Mail получателя сообщения");
            entity.Property(e => e.Birthdate)
                .HasComment("Дата рождения")
                .HasColumnType("datetime");
            entity.Property(e => e.Birthplace)
                .HasMaxLength(100)
                .HasComment("Место рождения");
            entity.Property(e => e.CreateDate)
                .HasComment("Дата создания записи")
                .HasColumnType("datetime");
            entity.Property(e => e.DocumentFilesId)
                .HasMaxLength(32)
                .IsFixedLength()
                .HasColumnName("DocumentFilesID");
            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .HasComment("E-мейл");
            entity.Property(e => e.Fio)
                .HasMaxLength(55)
                .HasComputedColumnSql("((isnull([Lastname],'')+isnull(' '+(left([Firstname],(1))+'.'),''))+isnull(left([Middlename],(1))+'.',''))", false)
                .HasColumnName("FIO");
            entity.Property(e => e.Firm)
                .HasMaxLength(255)
                .HasComment("Название организации");
            entity.Property(e => e.Firstname)
                .HasMaxLength(50)
                .HasComment("Имя");
            entity.Property(e => e.HasMiddlename).HasComment("Галка присутствия отчества у посетителя");
            entity.Property(e => e.Iin)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasComment("ИИН")
                .HasColumnName("IIN");
            entity.Property(e => e.IsAlien).HasComment("1 - Иностранный гражданин");
            entity.Property(e => e.IsAutoGuest).HasComment("1 - Автоматически созданное имя посетителя");
            entity.Property(e => e.LastName)
                .HasMaxLength(50)
                .HasComment("Фамилия");
            entity.Property(e => e.MiddleName)
                .HasMaxLength(50)
                .HasComment("Отчество");
            entity.Property(e => e.MobilePhone)
                .HasMaxLength(100)
                .HasComment("Мобильный телефон");
            entity.Property(e => e.OriginalId).HasColumnName("OriginalID");
            entity.Property(e => e.Phones)
                .HasMaxLength(100)
                .HasComment("Телефон");
            entity.Property(e => e.Position).HasMaxLength(200);
            entity.Property(e => e.Status)
                .HasComment("Статус (активен/неактивен)")
                .HasDefaultValue((byte)1, "DF_Visitors_Status");
            entity.Property(e => e.TypeId).HasComment("Тип посетителя, 0 - обычный, 1 - постоянный, 2 - временный постоянный (Постоянный посетитель без привязки к сотруднику. Должен быть привязан к сотруднику и переведен в тип 1 при создании постоянного пропуска)");
            entity.Property(e => e.VisitorNotes).HasMaxLength(2000);

            entity.HasOne(d => d.Original).WithMany(p => p.InverseOriginal)
                .HasForeignKey(d => d.OriginalId)
                .HasConstraintName("FK_Visitors_Visitors");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
