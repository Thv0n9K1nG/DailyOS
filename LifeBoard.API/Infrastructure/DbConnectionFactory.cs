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

            // Migration: add 'done_late' to tasks.status ENUM if not already present
            try
            {
                // Check current ENUM definition from information_schema
                cmd.CommandText = @"
                    SELECT COLUMN_TYPE FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                      AND TABLE_NAME   = 'tasks'
                      AND COLUMN_NAME  = 'status'";
                var enumDef = (await cmd.ExecuteScalarAsync())?.ToString() ?? "";

                if (!enumDef.Contains("done_late"))
                {
                    cmd.CommandText = @"
                        ALTER TABLE tasks
                        MODIFY COLUMN status
                            ENUM('pending','in_progress','done','done_late','archived')
                            NOT NULL DEFAULT 'pending';";
                    await cmd.ExecuteNonQueryAsync();
                    logger.LogInformation("Migrated tasks.status ENUM to include 'done_late'.");
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to run migration for tasks.status done_late.");
            }

            // Migration: add stopwatch_state column to focus_sessions if not present
            try
            {
                cmd.CommandText = "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'focus_sessions' AND COLUMN_NAME = 'stopwatch_state'";
                var stateColCount = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                if (stateColCount == 0)
                {
                    cmd.CommandText = "ALTER TABLE focus_sessions ADD COLUMN stopwatch_state ENUM('idle','running','paused','stopped') NOT NULL DEFAULT 'stopped';";
                    await cmd.ExecuteNonQueryAsync();
                    logger.LogInformation("Added stopwatch_state column to focus_sessions.");
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to run migration for focus_sessions.stopwatch_state.");
            }

            // Migration: add paused_duration_seconds column to focus_sessions if not present
            try
            {
                cmd.CommandText = "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'focus_sessions' AND COLUMN_NAME = 'paused_duration_seconds'";
                var pausedColCount = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                if (pausedColCount == 0)
                {
                    cmd.CommandText = "ALTER TABLE focus_sessions ADD COLUMN paused_duration_seconds INT NOT NULL DEFAULT 0;";
                    await cmd.ExecuteNonQueryAsync();
                    logger.LogInformation("Added paused_duration_seconds column to focus_sessions.");
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to run migration for focus_sessions.paused_duration_seconds.");
            }

            // Migration: make end_time nullable in focus_sessions (running sessions have no endTime yet)
            try
            {
                cmd.CommandText = @"
                    SELECT IS_NULLABLE FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                      AND TABLE_NAME   = 'focus_sessions'
                      AND COLUMN_NAME  = 'end_time'";
                var isNullable = (await cmd.ExecuteScalarAsync())?.ToString() ?? "NO";
                if (isNullable == "NO")
                {
                    cmd.CommandText = "ALTER TABLE focus_sessions MODIFY COLUMN end_time DATETIME NULL;";
                    await cmd.ExecuteNonQueryAsync();
                    logger.LogInformation("Made focus_sessions.end_time nullable.");
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to run migration for focus_sessions.end_time nullable.");
            }

            // Migration: add current_segment_start column to focus_sessions if not present
            try
            {
                cmd.CommandText = "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'focus_sessions' AND COLUMN_NAME = 'current_segment_start'";
                var segmentColCount = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                if (segmentColCount == 0)
                {
                    cmd.CommandText = "ALTER TABLE focus_sessions ADD COLUMN current_segment_start DATETIME NULL;";
                    await cmd.ExecuteNonQueryAsync();
                    logger.LogInformation("Added current_segment_start column to focus_sessions.");
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to run migration for focus_sessions.current_segment_start.");
            }

            logger.LogInformation("Database migration completed successfully.");


        }
        catch (Exception ex) { logger.LogError(ex, "Database migration failed."); }
    }
}
