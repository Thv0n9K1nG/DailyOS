namespace LifeBoard.API.BackgroundServices;

/// <summary>
/// Runs on app startup and every hour:
/// 1. Auto-import tomorrow tasks when a new day begins
/// 2. Create recurring task instances
/// </summary>
public class DailyTaskScheduler(IServiceScopeFactory scopeFactory, ILogger<DailyTaskScheduler> logger)
    : BackgroundService
{
    private DateOnly _lastRunDate = DateOnly.MinValue;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            if (_lastRunDate < today)
            {
                logger.LogInformation("DailyTaskScheduler: running daily tasks for {Date}", today);
                using var scope = scopeFactory.CreateScope();
                // TODO: inject ITaskService and call AutoImportTomorrowTasksAsync(today)
                // TODO: inject ITaskService and call CreateRecurringInstancesAsync(today)
                _lastRunDate = today;
            }
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
}
