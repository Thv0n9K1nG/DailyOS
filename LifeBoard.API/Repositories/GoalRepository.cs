using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

// TODO: Implement SQL queries — see docs/07-ERD-Database-Design.md
public class GoalRepository : IGoalRepository
{
    private readonly DbConnectionFactory _db;
    public GoalRepository(DbConnectionFactory db) { _db = db; }
}
