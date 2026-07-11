using MySqlConnector;
using System.Data;

namespace LifeBoard.API.Infrastructure;

public class DbConnectionFactory(IConfiguration config, ILogger<DbConnectionFactory> logger)
{
    private readonly string _connectionString =
        config.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string not found.");

    public IDbConnection CreateConnection() => new MySqlConnection(_connectionString);

    public async Task EnsureDatabaseMigratedAsync()
    {
        try
        {
            var migrationPath = Path.Combine(AppContext.BaseDirectory, "Migrations", "001_init_schema.sql");
            if (!File.Exists(migrationPath)) { logger.LogWarning("Migration file not found: {Path}", migrationPath); return; }

            var sql = await File.ReadAllTextAsync(migrationPath);
            using var conn = new MySqlConnection(_connectionString);
            await conn.OpenAsync();
            using var cmd = conn.CreateCommand();
            // Split by delimiter and run each statement
            foreach (var statement in sql.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                if (string.IsNullOrWhiteSpace(statement)) continue;
                cmd.CommandText = statement;
                await cmd.ExecuteNonQueryAsync();
            }
            logger.LogInformation("Database migration completed successfully.");
        }
        catch (Exception ex) { logger.LogError(ex, "Database migration failed."); }
    }
}
