using LifeBoard.API.Models.DTOs.Analytics;

namespace LifeBoard.API.Services.Interfaces;

public interface IAnalyticsService
{
    Task<WeeklyAnalyticsDto> GetWeeklyAsync(DateTime weekStart);
    Task<MonthlyAnalyticsDto> GetMonthlyAsync(int year, int month);
    Task<YearlyAnalyticsDto> GetYearlyAsync(int year);
    Task<StatisticsDto> GetStatisticsAsync(DateTime from, DateTime to);
}

