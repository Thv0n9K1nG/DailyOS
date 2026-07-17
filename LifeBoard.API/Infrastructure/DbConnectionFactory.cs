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

            // Check if splits column exists on focus_sessions, if not, add it
            try
            {
                cmd.CommandText = "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'focus_sessions' AND COLUMN_NAME = 'splits'";
                var columnCount = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                if (columnCount == 0)
                {
                    cmd.CommandText = "ALTER TABLE focus_sessions ADD COLUMN splits TEXT NULL;";
                    await cmd.ExecuteNonQueryAsync();
                    logger.LogInformation("Added splits column to focus_sessions table.");
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to run custom migration for focus_sessions.splits column.");
            }

            logger.LogInformation("Database migration completed successfully.");
        }
        catch (Exception ex) { logger.LogError(ex, "Database migration failed."); }
    }
}
