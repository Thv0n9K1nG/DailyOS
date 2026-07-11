// ── Enums ────────────────────────────────────────────────────
export type Priority       = "low" | "medium" | "high";
export type TaskStatus     = "pending" | "in_progress" | "done" | "archived";
export type RecurrenceType = "daily" | "weekly" | "monthly";
export type SessionType    = "stopwatch" | "pomodoro";
export type GoalStatus     = "active" | "completed" | "paused";
export type Frequency      = "daily" | "weekly" | "monthly";
export type Theme          = "light" | "dark";

// ── Tag ──────────────────────────────────────────────────────
export interface Tag { id: number; name: string; color: string; }

// ── Task ─────────────────────────────────────────────────────
export interface Task {
  id: number; title: string; description?: string;
  priority: Priority; status: TaskStatus;
  deadline?: string; isRecurring: boolean;
  recurrenceType?: RecurrenceType; recurrenceEndDate?: string;
  parentTaskId?: number; plannedDate?: string;
  tags: Tag[]; createdAt: string; completedAt?: string; updatedAt: string;
}
export interface CreateTaskDto {
  title: string; description?: string; priority?: Priority;
  deadline?: string; plannedDate?: string; isRecurring?: boolean;
  recurrenceType?: RecurrenceType; recurrenceEndDate?: string; tagIds?: number[];
}
export interface UpdateTaskDto extends CreateTaskDto {}
export interface TaskFilters {
  status?: TaskStatus; priority?: Priority; tagId?: number;
  plannedDate?: string; search?: string; page?: number; pageSize?: number;
}
export interface PagedResult<T> { data: T[]; total: number; }

// ── Habit ────────────────────────────────────────────────────
export interface Habit {
  id: number; name: string; description?: string;
  frequency: Frequency; icon?: string; color: string;
  isActive: boolean; streak: number; checkedInToday: boolean; createdAt: string;
}
export interface CreateHabitDto {
  name: string; description?: string; frequency: Frequency; icon?: string; color?: string;
}
export interface HabitCheckIn {
  id: number; habitId: number; checkinDate: string; isCompleted: boolean;
}

// ── Focus Session ────────────────────────────────────────────
export interface FocusSession {
  id: number; sessionType: SessionType; label?: string;
  startTime: string; endTime: string; durationSeconds: number;
  sessionDate: string; createdAt: string;
}
export interface CreateFocusSessionDto {
  sessionType: SessionType; label?: string; startTime: string; endTime: string;
}

// ── Goal ─────────────────────────────────────────────────────
export interface Goal {
  id: number; title: string; description?: string;
  currentValue: number; targetValue: number; unit: string;
  progressPercent: number; deadline?: string;
  status: GoalStatus; createdAt: string; updatedAt: string;
}
export interface CreateGoalDto {
  title: string; description?: string; currentValue?: number;
  targetValue: number; unit: string; deadline?: string;
}

// ── Daily Note ───────────────────────────────────────────────
export interface DailyNote { id: number; noteDate: string; content: string; updatedAt: string; }

// ── Mood ─────────────────────────────────────────────────────
export interface MoodEntry {
  id: number; entryDate: string; score: number; note?: string; createdAt: string;
}

// ── Countdown ────────────────────────────────────────────────
export interface Countdown {
  id: number; title: string; targetDate: string;
  daysRemaining: number; icon?: string; color?: string;
}
export interface CreateCountdownDto { title: string; targetDate: string; icon?: string; color?: string; }

// ── Settings ─────────────────────────────────────────────────
export interface Settings {
  theme: Theme; pomodoroFocusMinutes: number; pomodoroBreakMinutes: number;
  pomodoroRounds: number; habitGracePeriodDays: number; language: string;
}

// ── Analytics ────────────────────────────────────────────────
export interface HeatmapDay {
  date: string; taskCount: number; focusMinutes: number;
  habitDone: number; intensityLevel: 0 | 1 | 2 | 3 | 4;
}
export interface WeeklyDay {
  date: string; completedTasks: number; focusMinutes: number;
  habitsCompleted: number; habitsTotal: number; moodScore?: number;
}

// ── Daily Detail ─────────────────────────────────────────────
export interface DailyDetail {
  date: string;
  tasks: { total: number; completed: number; items: Task[] };
  focusSessions: { totalMinutes: number; items: FocusSession[] };
  habitCheckIns: { habitId: number; habitName: string; isCompleted: boolean; streak: number }[];
  dailyNote?: Pick<DailyNote, "content">;
  moodEntry?: Pick<MoodEntry, "score" | "note">;
}

// ── Search ───────────────────────────────────────────────────
export interface SearchResults {
  query: string;
  results: {
    tasks: Pick<Task, "id" | "title" | "status">[];
    notes: { noteDate: string; preview: string }[];
    habits: Pick<Habit, "id" | "name">[];
    goals: Pick<Goal, "id" | "title">[];
  };
  totalCount: number;
}

// ── API Error ────────────────────────────────────────────────
export interface ApiError { status: number; error: string; message: string; details?: string[]; }
