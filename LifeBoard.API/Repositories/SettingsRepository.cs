using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

// TODO: Implement SQL queries — see docs/07-ERD-Database-Design.md
public class SettingsRepository : ISettingsRepository
{
    private readonly DbConnectionFactory _db;
    public SettingsRepository(DbConnectionFactory db) { _db = db; }
}
