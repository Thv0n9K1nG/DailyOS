namespace LifeBoard.API.Models.Entities;

public class SettingsEntity
{
    public string Theme { get; set; } = "dark";
    public int PomodoroFocusMinutes { get; set; } = 25;
    public int PomodoroBreakMinutes { get; set; } = 5;
    public int PomodoroRounds { get; set; } = 4;
    public int HabitGracePeriodDays { get; set; } = 0;
    public string Language { get; set; } = "vi";
}
