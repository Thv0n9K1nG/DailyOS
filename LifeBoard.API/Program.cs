using Serilog;
using LifeBoard.API.Infrastructure;
using LifeBoard.API.Middleware;
using LifeBoard.API.Services;
using LifeBoard.API.Services.Interfaces;
using LifeBoard.API.Repositories;
using LifeBoard.API.Repositories.Interfaces;
using LifeBoard.API.BackgroundServices;
using FluentValidation;
using FluentValidation.AspNetCore;

// ── Serilog Setup ─────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/lifeboard-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

// ── Services ──────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// CORS — allow frontend dev server
builder.Services.AddCors(opt => opt.AddPolicy("Frontend", policy =>
    policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
          .AllowAnyHeader().AllowAnyMethod()));

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Infrastructure
builder.Services.AddSingleton<DbConnectionFactory>();

// Repositories
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ITagRepository, TagRepository>();
builder.Services.AddScoped<IHabitRepository, HabitRepository>();
builder.Services.AddScoped<IFocusSessionRepository, FocusSessionRepository>();
builder.Services.AddScoped<IGoalRepository, GoalRepository>();
builder.Services.AddScoped<IDailyNoteRepository, DailyNoteRepository>();
builder.Services.AddScoped<IMoodEntryRepository, MoodEntryRepository>();
builder.Services.AddScoped<ICountdownRepository, CountdownRepository>();
builder.Services.AddScoped<ISettingsRepository, SettingsRepository>();

// Services
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IHabitService, HabitService>();
builder.Services.AddScoped<IFocusSessionService, FocusSessionService>();
builder.Services.AddScoped<IGoalService, GoalService>();
builder.Services.AddScoped<IDailyNoteService, DailyNoteService>();
builder.Services.AddScoped<IMoodEntryService, MoodEntryService>();
builder.Services.AddScoped<ICountdownService, CountdownService>();
builder.Services.AddScoped<ISettingsService, SettingsService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<IBackupService, BackupService>();

// Background service for recurring tasks & auto-import
builder.Services.AddHostedService<DailyTaskScheduler>();

var app = builder.Build();

// ── Middleware pipeline ────────────────────────────────────────
app.UseSerilogRequestLogging();
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("Frontend");
app.UseAuthorization();
app.MapControllers();

// Run DB migration on startup
using (var scope = app.Services.CreateScope())
{
    var dbFactory = scope.ServiceProvider.GetRequiredService<DbConnectionFactory>();
    await dbFactory.EnsureDatabaseMigratedAsync();
}

app.Run();
