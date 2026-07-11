# 08 - Software Design Document (SDD)

**Dự án:** LifeBoard — Personal Productivity System
**Phiên bản:** 1.0
**Ngày:** 2026-07-10

---

## 1. Tổng quan Kiến trúc

LifeBoard sử dụng kiến trúc **3-tier** tách biệt hoàn toàn:

```
┌─────────────────────────────────┐
│   PRESENTATION LAYER            │
│   React 18 + TypeScript + Vite  │
│   (SPA chạy trên Browser)       │
└────────────┬────────────────────┘
             │ HTTP/REST (JSON)
             │ localhost:5173 → localhost:5000
┌────────────▼────────────────────┐
│   APPLICATION LAYER             │
│   ASP.NET Core 8 Web API        │
│   Controllers → Services →      │
│   Repositories                  │
└────────────┬────────────────────┘
             │ MySQL Connector
┌────────────▼────────────────────┐
│   DATA LAYER                    │
│   MySQL 8.0 (local)             │
│   11 tables                     │
└─────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Cấu trúc Thư mục

```
src/
├── assets/               # Static assets (fonts, icons)
├── components/           # Shared/reusable UI components
│   ├── ui/               # Primitives: Button, Input, Modal, Badge...
│   ├── layout/           # AppShell, Sidebar, Header, PageWrapper
│   └── charts/           # Recharts wrappers: BarChart, HeatmapGrid...
├── features/             # Feature modules (co-located)
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   ├── widgets/      # TodayTasks, WeekProgress, CountdownWidget...
│   │   └── hooks/        # useDashboard.ts
│   ├── tasks/
│   │   ├── TasksPage.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   └── hooks/        # useTasks.ts, useTaskMutations.ts
│   ├── calendar/
│   ├── tomorrow/
│   ├── habits/
│   ├── goals/
│   ├── focus/            # Stopwatch + Pomodoro
│   ├── notes/
│   ├── mood/
│   ├── analytics/
│   │   ├── WeeklyPage.tsx
│   │   ├── MonthlyPage.tsx
│   │   └── YearlyPage.tsx
│   ├── statistics/
│   ├── search/
│   ├── countdown/
│   └── settings/
├── hooks/                # Global custom hooks
│   ├── useApi.ts         # Axios wrapper với error handling
│   └── useTheme.ts
├── lib/
│   ├── api.ts            # Axios instance (baseURL, interceptors)
│   ├── queryClient.ts    # TanStack Query client config
│   └── utils.ts          # date helpers, formatters
├── stores/               # Zustand global stores
│   ├── themeStore.ts
│   └── settingsStore.ts
├── router/
│   └── index.tsx         # React Router v6 routes
├── styles/
│   ├── globals.css       # CSS variables, resets
│   └── themes.css        # Dark/Light theme tokens
├── types/                # TypeScript interfaces & enums
│   ├── task.types.ts
│   ├── habit.types.ts
│   └── ...
└── main.tsx
```

### 2.2 State Management

| Loại State | Giải pháp | Mô tả |
|-----------|-----------|-------|
| Server state | **TanStack Query v5** | Cache, refetch, mutation cho API calls |
| UI / local state | **React useState / useReducer** | Form state, modal open/close |
| Global app state | **Zustand** | Theme, Settings (đọc 1 lần) |

### 2.3 Routing (React Router v6)

| Route | Component | Feature |
|-------|-----------|---------|
| `/` | `DashboardPage` | Dashboard |
| `/calendar` | `CalendarPage` | Calendar |
| `/calendar/:date` | `DailyDetailPage` | Daily Detail |
| `/tasks` | `TasksPage` | Todo Management |
| `/tomorrow` | `TomorrowPage` | Tomorrow Planning |
| `/habits` | `HabitsPage` | Habit Tracker |
| `/goals` | `GoalsPage` | Goal Tracker |
| `/focus/stopwatch` | `StopwatchPage` | Stopwatch |
| `/focus/pomodoro` | `PomodoroPage` | Pomodoro Timer |
| `/notes` | `NotesPage` | Daily Notes |
| `/mood` | `MoodPage` | Mood Tracker |
| `/analytics/weekly` | `WeeklyPage` | Weekly Dashboard |
| `/analytics/monthly` | `MonthlyPage` | Monthly Dashboard |
| `/analytics/yearly` | `YearlyPage` | Yearly Heatmap |
| `/statistics` | `StatisticsPage` | Statistics |
| `/search` | `SearchPage` | Search |
| `/countdown` | `CountdownPage` | Countdown Board |
| `/settings` | `SettingsPage` | Settings |

### 2.4 Data Fetching Pattern

```typescript
// Mỗi feature dùng TanStack Query hooks
// Ví dụ: useTasks.ts
export const useTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskApi.getAll(filters),
    staleTime: 30_000,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
};
```

---

## 3. Backend Architecture

### 3.1 Cấu trúc Thư mục (ASP.NET Core 8)

```
LifeBoard.API/
├── Controllers/          # HTTP endpoints, request validation
│   ├── TasksController.cs
│   ├── TagsController.cs
│   ├── HabitsController.cs
│   ├── FocusSessionsController.cs
│   ├── GoalsController.cs
│   ├── DailyNotesController.cs
│   ├── MoodEntriesController.cs
│   ├── CountdownsController.cs
│   ├── SettingsController.cs
│   ├── AnalyticsController.cs
│   ├── SearchController.cs
│   └── BackupController.cs
├── Services/             # Business logic
│   ├── Interfaces/
│   │   ├── ITaskService.cs
│   │   └── ...
│   ├── TaskService.cs
│   ├── HabitService.cs   # Streak calculation, grace period
│   ├── AnalyticsService.cs
│   ├── RecurringTaskService.cs
│   └── BackupService.cs
├── Repositories/         # Data access (Dapper)
│   ├── Interfaces/
│   │   ├── ITaskRepository.cs
│   │   └── ...
│   ├── TaskRepository.cs
│   └── ...
├── Models/
│   ├── Entities/         # DB models
│   │   ├── Task.cs
│   │   ├── Habit.cs
│   │   └── ...
│   └── DTOs/             # Request/Response DTOs
│       ├── Task/
│       │   ├── CreateTaskDto.cs
│       │   ├── UpdateTaskDto.cs
│       │   └── TaskResponseDto.cs
│       └── ...
├── Middleware/
│   ├── ErrorHandlingMiddleware.cs
│   └── CorsMiddleware.cs
├── Infrastructure/
│   ├── DbConnectionFactory.cs  # MySQL connection via Dapper
│   └── MigrationRunner.cs      # Chạy SQL migration scripts
├── BackgroundServices/
│   └── DailyTaskScheduler.cs   # Recurring tasks & auto-import
├── appsettings.json
├── appsettings.Development.json
└── Program.cs
```

### 3.2 Layered Architecture Flow

```
HTTP Request
    │
    ▼
[Controller]          — Validate input DTO, map → Service call
    │
    ▼
[Service]             — Business logic, orchestrate Repositories
    │
    ▼
[Repository]          — SQL queries via Dapper, return Entity
    │
    ▼
[MySQL Database]
    │
    ▼ (reverse)
[Entity → DTO]        — Map tại Controller trước khi trả về
    │
    ▼
HTTP Response (JSON)
```

### 3.3 Design Patterns

| Pattern | Áp dụng ở | Mục đích |
|---------|-----------|---------|
| Repository Pattern | `Repositories/` | Tách biệt data access, dễ mock khi test |
| Service Layer | `Services/` | Business logic không lẫn vào Controller |
| DTO Pattern | `Models/DTOs/` | Tránh expose Entity thô ra API |
| Dependency Injection | Toàn bộ | ASP.NET Core DI container |
| Background Service | `DailyTaskScheduler` | Auto-create recurring tasks hàng ngày |
| Factory | `DbConnectionFactory` | Tạo MySQL connection |

### 3.4 Background Service — DailyTaskScheduler

Chạy mỗi lần app khởi động, kiểm tra nếu đã sang ngày mới:

```
DailyTaskScheduler.ExecuteAsync()
    ├── Đọc ngày chạy lần cuối từ settings
    ├── Nếu lastRunDate < TODAY:
    │       ├── Auto-import Tomorrow tasks: planned_date = today, status = pending → giữ nguyên
    │       ├── Create Recurring Task instances (daily, weekly check)
    │       └── Cập nhật lastRunDate = TODAY
    └── Sleep 1 giờ → lặp lại
```

### 3.5 Error Handling

Tất cả exception được bắt tại `ErrorHandlingMiddleware`:

```csharp
// Response format thống nhất
{
  "status": 400,
  "error": "Bad Request",
  "message": "Title is required",
  "details": []        // validation errors nếu có
}
```

| HTTP Status | Nguyên nhân |
|-------------|-------------|
| 200 OK | Thành công (GET, PUT, PATCH) |
| 201 Created | Tạo mới thành công (POST) |
| 204 No Content | Xóa thành công (DELETE) |
| 400 Bad Request | Validation thất bại |
| 404 Not Found | Resource không tồn tại |
| 500 Internal Server Error | Lỗi server không lường trước |

---

## 4. Module Design Chi tiết

### 4.1 Module: Task Management

```
TasksController
    ├── GET    /api/v1/tasks              → TaskService.GetAll(filters)
    ├── GET    /api/v1/tasks/{id}         → TaskService.GetById(id)
    ├── POST   /api/v1/tasks              → TaskService.Create(dto)
    ├── PUT    /api/v1/tasks/{id}         → TaskService.Update(id, dto)
    ├── PATCH  /api/v1/tasks/{id}/complete → TaskService.Complete(id)
    ├── PATCH  /api/v1/tasks/{id}/archive  → TaskService.Archive(id)
    └── DELETE /api/v1/tasks/{id}         → TaskService.Delete(id)

TaskService.Create(dto):
    1. Validate: title không rỗng
    2. Map DTO → Entity
    3. Nếu isRecurring: validate recurrenceType có giá trị
    4. TaskRepository.Insert(entity)
    5. Nếu có tags: TaskRepository.AssignTags(taskId, tagIds)
    6. Return TaskResponseDto
```

### 4.2 Module: Habit Tracker + Streak

```
HabitService.GetStreakForHabit(habitId):
    1. Query HabitCheckIn WHERE habit_id = X AND is_completed = 1
       ORDER BY checkin_date DESC
    2. Lặp từ hôm nay ngược lại, đếm ngày liên tiếp
    3. Grace period: nếu bỏ ≤ N ngày thì không ngắt chuỗi
    4. Return streak count
```

### 4.3 Module: Analytics

```
AnalyticsService.GetYearlyHeatmap(year):
    1. Query tasks (completed_at trong năm, status = done) → GROUP BY date
    2. Query focus_sessions (session_date trong năm) → GROUP BY date, SUM duration
    3. Query habit_checkins (checkin_date trong năm, completed) → GROUP BY date
    4. Merge 3 tập kết quả theo date
    5. Return List<HeatmapDay> { date, taskCount, focusMinutes, habitDone }

AnalyticsService.GetWeeklyStats(weekStart):
    1. Tính weekStart, weekEnd
    2. Query tasks completed trong tuần, GROUP BY day
    3. Query focus_sessions trong tuần, GROUP BY day
    4. Query habit_checkins trong tuần
    5. Return WeeklyStatsDto
```

### 4.4 Module: Backup / Restore

```
BackupService.Export():
    1. Dump toàn bộ data từ 11 bảng sang JSON array
    2. Wrap trong envelope: { version, exportedAt, data: { tasks, tags, ... } }
    3. Serialize → file .json
    4. Return file stream cho download

BackupService.Import(file):
    1. Parse JSON, validate format & version
    2. Begin transaction
    3. TRUNCATE tất cả bảng (theo thứ tự tránh FK)
    4. INSERT dữ liệu từ file theo thứ tự
    5. Commit transaction
    6. Return success
```

---

## 5. Frontend Component Design

### 5.1 AppShell Layout

```
┌─────────────────────────────────────────────────────┐
│  HEADER                                             │
│  [Logo] [Page Title]          [Search] [Theme Toggle]│
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │  MAIN CONTENT AREA                       │
│ (240px)  │  <Outlet /> (React Router)               │
│          │                                          │
│ Nav links│                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### 5.2 Shared Components

| Component | Props | Mô tả |
|-----------|-------|-------|
| `Button` | `variant`, `size`, `loading`, `onClick` | Nút bấm với các variant |
| `Input` | `label`, `error`, `placeholder` | Input với label và error state |
| `Modal` | `isOpen`, `onClose`, `title`, `children` | Dialog overlay |
| `Badge` | `color`, `label` | Tag/label nhỏ |
| `ProgressBar` | `value`, `max`, `color` | Thanh tiến độ |
| `Tooltip` | `content`, `children` | Hover tooltip |
| `ConfirmDialog` | `message`, `onConfirm`, `onCancel` | Xác nhận nguy hiểm |
| `Skeleton` | `width`, `height` | Loading placeholder |
| `EmptyState` | `icon`, `title`, `description` | Trạng thái rỗng |

### 5.3 TaskCard Component

```typescript
interface TaskCardProps {
  task: TaskResponseDto;
  onComplete: (id: number) => void;
  onEdit: (task: TaskResponseDto) => void;
  onDelete: (id: number) => void;
}
// Hiển thị: checkbox, title, priority badge, deadline, tags
// Hover: action buttons (edit, delete)
```

---

## 6. Cấu hình & Môi trường

### 6.1 Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 6.2 Backend (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=lifeboard;Uid=root;Pwd=password;"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  },
  "App": {
    "ApiVersion": "v1"
  }
}
```

### 6.3 Docker Compose (tùy chọn)

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: lifeboard
    ports: ["3306:3306"]
    volumes: ["mysql_data:/var/lib/mysql"]

  api:
    build: ./LifeBoard.API
    ports: ["5000:5000"]
    depends_on: [mysql]

  frontend:
    build: ./lifeboard-client
    ports: ["5173:5173"]
    depends_on: [api]
```

---

## 7. Dependency Checklist

### Frontend

| Package | Version | Mục đích |
|---------|---------|---------|
| react | 18.x | UI framework |
| react-router-dom | 6.x | Routing |
| @tanstack/react-query | 5.x | Server state |
| zustand | 4.x | Global state |
| axios | 1.x | HTTP client |
| recharts | 2.x | Charts |
| react-markdown | 9.x | Markdown render |
| date-fns | 3.x | Date utilities |
| lucide-react | latest | Icons |

### Backend

| Package | Mục đích |
|---------|---------|
| Dapper | Micro-ORM cho MySQL queries |
| MySql.Data / MySqlConnector | MySQL driver |
| FluentValidation | DTO validation |
| Serilog | Logging |
