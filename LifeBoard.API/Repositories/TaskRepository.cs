using Dapper;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Repositories.Interfaces;

namespace LifeBoard.API.Repositories;

// TODO: Implement SQL queries — see docs/07-ERD-Database-Design.md
public class TaskRepository : ITaskRepository
{
    private readonly DbConnectionFactory _db;
    public TaskRepository(DbConnectionFactory db) { _db = db; }
}
