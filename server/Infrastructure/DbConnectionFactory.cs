using MySqlConnector;

namespace LifeBoard.Infrastructure;

public class DbConnectionFactory(IConfiguration config)
{
    private readonly string _connStr = config.GetConnectionString("Default")
        ?? throw new InvalidOperationException("Connection string 'Default' not found.");

    public MySqlConnection CreateConnection() => new(_connStr);

    public async Task MigrateAsync()
    {
        var sql = await File.ReadAllTextAsync(
            Path.Combine(AppContext.BaseDirectory, "Migrations", "schema.sql"));

        await using var conn = CreateConnection();
        await conn.OpenAsync();

        // Split by semicolon and execute each statement
        foreach (var stmt in sql.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (string.IsNullOrWhiteSpace(stmt)) continue;
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = stmt;
            await cmd.ExecuteNonQueryAsync();
        }
    }
}
