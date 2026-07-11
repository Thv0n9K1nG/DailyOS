import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage }  from "@/features/dashboard/DashboardPage";
import { CalendarPage }   from "@/features/calendar/CalendarPage";
import { DailyDetailPage } from "@/features/calendar/DailyDetailPage";
import { TasksPage }      from "@/features/tasks/TasksPage";
import { TomorrowPage }   from "@/features/tomorrow/TomorrowPage";
import { HabitsPage }     from "@/features/habits/HabitsPage";
import { GoalsPage }      from "@/features/goals/GoalsPage";
import { StopwatchPage }  from "@/features/focus/StopwatchPage";
import { PomodoroPage }   from "@/features/focus/PomodoroPage";
import { NotesPage }      from "@/features/notes/NotesPage";
import { MoodPage }       from "@/features/mood/MoodPage";
import { WeeklyPage }     from "@/features/analytics/WeeklyPage";
import { MonthlyPage }    from "@/features/analytics/MonthlyPage";
import { YearlyPage }     from "@/features/analytics/YearlyPage";
import { StatisticsPage } from "@/features/statistics/StatisticsPage";
import { SearchPage }     from "@/features/search/SearchPage";
import { CountdownPage }  from "@/features/countdown/CountdownPage";
import { SettingsPage }   from "@/features/settings/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true,                  element: <DashboardPage /> },
      { path: "calendar",             element: <CalendarPage /> },
      { path: "calendar/:date",       element: <DailyDetailPage /> },
      { path: "tasks",                element: <TasksPage /> },
      { path: "tomorrow",             element: <TomorrowPage /> },
      { path: "habits",               element: <HabitsPage /> },
      { path: "goals",                element: <GoalsPage /> },
      { path: "focus/stopwatch",      element: <StopwatchPage /> },
      { path: "focus/pomodoro",       element: <PomodoroPage /> },
      { path: "notes",                element: <NotesPage /> },
      { path: "mood",                 element: <MoodPage /> },
      { path: "analytics/weekly",     element: <WeeklyPage /> },
      { path: "analytics/monthly",    element: <MonthlyPage /> },
      { path: "analytics/yearly",     element: <YearlyPage /> },
      { path: "statistics",           element: <StatisticsPage /> },
      { path: "search",               element: <SearchPage /> },
      { path: "countdown",            element: <CountdownPage /> },
      { path: "settings",             element: <SettingsPage /> },
    ],
  },
]);
