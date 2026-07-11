using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

// TODO: Implement SQL queries — see docs/07-ERD-Database-Design.md
public class HabitRepository : IHabitRepository
{
    private readonly DbConnectionFactory _db;
    public HabitRepository(DbConnectionFactory db) { _db = db; }
}
