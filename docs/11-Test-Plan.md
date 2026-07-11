# 11 - Test Plan

**Dự án:** LifeBoard — Personal Productivity System
**Phiên bản:** 1.0
**Ngày:** 2026-07-11

---

## 1. Giới thiệu

### 1.1 Mục đích

Tài liệu này định nghĩa chiến lược, phạm vi, phương pháp và các test case cho dự án LifeBoard. Mục tiêu là đảm bảo tất cả chức năng hoạt động đúng theo SRS, API Specification và Use Cases đã định nghĩa.

### 1.2 Phạm vi Kiểm thử

| Trong phạm vi | Ngoài phạm vi |
|--------------|--------------|
| Backend API (unit + integration) | Mobile browser |
| Frontend UI (component + E2E) | Cloud/multi-device sync |
| Database queries & constraints | Load testing quy mô lớn |
| Business logic (streak, recurring...) | Security penetration testing |
| Backup & Restore | — |

### 1.3 Tài liệu Tham chiếu

- `06-SRS.md` — Yêu cầu chức năng & phi chức năng
- `09-API-Specification.md` — API contracts
- `04-Use-Case.md` — Use cases
- `07-ERD-Database-Design.md` — Database schema

---

## 2. Chiến lược Kiểm thử

### 2.1 Pyramid Testing

```
        ┌──────────┐
        │   E2E    │  Ít nhưng bao phủ happy paths
        │  (Playwright) │
        ├──────────────┤
        │ Integration  │  API endpoints, DB interactions
        │  (xUnit)     │
        ├──────────────┤
        │  Unit Tests  │  Business logic, utilities
        │  (xUnit + Vitest) │
        └──────────────┘
```

### 2.2 Công cụ

| Layer | Tool | Ngôn ngữ |
|-------|------|---------|
| Backend Unit | xUnit + Moq | C# |
| Backend Integration | xUnit + TestContainers (MySQL) | C# |
| Frontend Unit | Vitest + React Testing Library | TypeScript |
| E2E | Playwright | TypeScript |
| API Manual | Postman Collection | — |

### 2.3 Môi trường

| Môi trường | Mô tả |
|-----------|-------|
| **Test** | MySQL in-memory / TestContainers; API chạy trên test host |
| **Development** | Localhost đầy đủ |
| **Staging** | Docker Compose local (nếu có) |

---

## 3. Test Cases — Backend Unit Tests

### TC-U-001: TaskService — Tạo task hợp lệ

| | |
|--|--|
| **Module** | TaskService.Create() |
| **Input** | `{ title: "Học React", priority: "high", deadline: "2026-07-15" }` |
| **Expected** | Task được tạo với `status = pending`, `createdAt` được ghi, trả về TaskResponseDto |
| **Pass Criteria** | Repository.Insert() được gọi 1 lần; DTO có đúng `title` và `priority` |

---

### TC-U-002: TaskService — Tạo task thiếu title

| | |
|--|--|
| **Input** | `{ title: "", priority: "medium" }` |
| **Expected** | Throw `ValidationException` với message "Title is required" |
| **Pass Criteria** | Exception được ném; Repository.Insert() không được gọi |

---

### TC-U-003: TaskService — Recurring task thiếu recurrenceType

| | |
|--|--|
| **Input** | `{ title: "Daily task", isRecurring: true, recurrenceType: null }` |
| **Expected** | Throw `ValidationException` |
| **Pass Criteria** | Validation bắt được trường hợp này |

---

### TC-U-004: HabitService — Tính Streak cơ bản

| | |
|--|--|
| **Module** | HabitService.GetStreak(habitId) |
| **Setup** | CheckIns: [today, yesterday, 2 ngày trước] = completed; 3 ngày trước = missed |
| **Expected** | Streak = 3 |
| **Pass Criteria** | Hàm trả về 3 |

---

### TC-U-005: HabitService — Streak bị ngắt

| | |
|--|--|
| **Setup** | CheckIns: [today = completed, yesterday = missed, 2 ngày trước = completed] |
| **Expected** | Streak = 1 (chỉ đếm từ hôm nay liên tiếp) |

---

### TC-U-006: HabitService — Grace Period

| | |
|--|--|
| **Setup** | `habitGracePeriodDays = 1`; CheckIns: [today = completed, yesterday = missed, 2 ngày trước = completed] |
| **Expected** | Streak = 3 (grace period cho phép bỏ 1 ngày) |

---

### TC-U-007: HabitService — Streak = 0 khi chưa check-in

| | |
|--|--|
| **Setup** | Không có CheckIn nào |
| **Expected** | Streak = 0 |

---

### TC-U-008: GoalService — Auto-complete khi đạt target

| | |
|--|--|
| **Module** | GoalService.UpdateProgress(goalId, newValue) |
| **Setup** | Goal: `currentValue = 80, targetValue = 100, status = active` |
| **Input** | `newValue = 100` |
| **Expected** | `status = completed`, `currentValue = 100` |

---

### TC-U-009: GoalService — Không complete khi chưa đạt target

| | |
|--|--|
| **Input** | `newValue = 99` (targetValue = 100) |
| **Expected** | `status = active`, `currentValue = 99` |

---

### TC-U-010: RecurringTaskService — Tạo daily instance

| | |
|--|--|
| **Module** | RecurringTaskService.ProcessDailyTasks() |
| **Setup** | Task gốc: `isRecurring = true, recurrenceType = daily`, chưa có instance hôm nay |
| **Expected** | Tạo 1 task instance mới với `plannedDate = today`, `parentTaskId = taskId gốc` |

---

### TC-U-011: RecurringTaskService — Không tạo duplicate

| | |
|--|--|
| **Setup** | Instance hôm nay đã tồn tại |
| **Expected** | Không tạo thêm instance |

---

### TC-U-012: AnalyticsService — Heatmap intensity level

| | |
|--|--|
| **Module** | AnalyticsService.CalculateIntensity(taskCount, focusMin, habitDone) |
| **Input** | `(0, 0, 0)` → level 0; `(1, 30, 1)` → level 1; `(5, 90, 3)` → level 3; `(10, 180, 5)` → level 4 |
| **Expected** | Đúng với mapping đã định nghĩa |

---

### TC-U-013: BackupService — Export format hợp lệ

| | |
|--|--|
| **Module** | BackupService.Export() |
| **Expected** | JSON có các key: `version`, `exportedAt`, `data.tasks`, `data.habits`, ... |
| **Pass Criteria** | Deserialize thành công; `version = "1.0"` |

---

### TC-U-014: BackupService — Import với file hợp lệ

| | |
|--|--|
| **Setup** | File backup đúng format |
| **Expected** | Transaction commit thành công; Dữ liệu được khôi phục |

---

### TC-U-015: BackupService — Import với file sai format

| | |
|--|--|
| **Setup** | File JSON thiếu key `data` |
| **Expected** | Throw `InvalidBackupException`; Không thay đổi dữ liệu hiện tại |

---

## 4. Test Cases — Backend Integration Tests

### TC-I-001: POST /tasks — Tạo task thành công

| | |
|--|--|
| **Method** | POST `/api/v1/tasks` |
| **Body** | `{ "title": "Test task", "priority": "medium" }` |
| **Expected** | HTTP 201; Response có `id`, `title`, `status: "pending"` |
| **DB Check** | Bản ghi tồn tại trong bảng `tasks` |

---

### TC-I-002: POST /tasks — Validation thất bại

| | |
|--|--|
| **Body** | `{ "title": "" }` |
| **Expected** | HTTP 400; `message` chứa "Title is required" |

---

### TC-I-003: PATCH /tasks/{id}/complete

| | |
|--|--|
| **Setup** | Task tồn tại với `status = pending` |
| **Expected** | HTTP 200; `status = "done"`, `completedAt != null` |

---

### TC-I-004: GET /tasks — Filter theo status

| | |
|--|--|
| **Setup** | 3 pending tasks, 2 done tasks |
| **Request** | GET `/api/v1/tasks?status=done` |
| **Expected** | HTTP 200; `total = 2`; tất cả items có `status = "done"` |

---

### TC-I-005: GET /tasks — Filter theo tag

| | |
|--|--|
| **Setup** | Tag id=1 gắn vào 2 tasks, 3 tasks khác không có tag này |
| **Request** | GET `/api/v1/tasks?tagId=1` |
| **Expected** | HTTP 200; `total = 2` |

---

### TC-I-006: DELETE /tags/{id} — Cascade xóa task_tags

| | |
|--|--|
| **Setup** | Tag id=1 gắn vào task id=5 |
| **Request** | DELETE `/api/v1/tags/1` |
| **Expected** | HTTP 204; Bản ghi trong `task_tags` bị xóa; task id=5 vẫn tồn tại |

---

### TC-I-007: POST /habits/{id}/checkins — Upsert

| | |
|--|--|
| **Setup** | Habit id=1 chưa có checkin hôm nay |
| **First call** | `{ "date": "today", "isCompleted": true }` → HTTP 200, tạo mới |
| **Second call** | `{ "date": "today", "isCompleted": false }` → HTTP 200, cập nhật |
| **DB Check** | Chỉ có 1 bản ghi trong `habit_checkins` cho (habit_id=1, today) |

---

### TC-I-008: PUT /daily-notes/{date} — Upsert

| | |
|--|--|
| **Lần 1** | PUT `/api/v1/daily-notes/2026-07-11` với `{ "content": "Hello" }` → HTTP 200 |
| **Lần 2** | PUT cùng ngày với `{ "content": "Updated" }` → HTTP 200 |
| **DB Check** | Chỉ có 1 bản ghi; `content = "Updated"` |

---

### TC-I-009: GET /analytics/yearly — Cấu trúc response

| | |
|--|--|
| **Request** | GET `/api/v1/analytics/yearly?year=2026` |
| **Expected** | HTTP 200; `heatmap` là array có 365 phần tử; mỗi phần tử có `date`, `taskCount`, `focusMinutes`, `habitDone`, `intensityLevel` |

---

### TC-I-010: GET /search — Tìm kiếm đa nguồn

| | |
|--|--|
| **Setup** | Task có title "React hooks"; Note có content "học React" |
| **Request** | GET `/api/v1/search?q=React` |
| **Expected** | HTTP 200; `results.tasks` có 1 item; `results.notes` có 1 item |

---

### TC-I-011: GET /backup/export — File hợp lệ

| | |
|--|--|
| **Expected** | HTTP 200; `Content-Disposition` header có `attachment`; Body deserialize được thành JSON hợp lệ |

---

### TC-I-012: Database Constraint — Unique mood per day

| | |
|--|--|
| **Action** | Insert 2 MoodEntry cùng `entry_date` |
| **Expected** | Lần 2 thất bại với DB unique constraint error |

---

## 5. Test Cases — Frontend Unit Tests (Vitest + RTL)

### TC-F-001: TaskCard — Render đúng thông tin

```typescript
test('renders task title, priority badge and deadline', () => {
  const task = { id: 1, title: 'Learn React', priority: 'high', deadline: '2026-07-15T00:00:00', tags: [] };
  render(<TaskCard task={task} onComplete={vi.fn()} onEdit={vi.fn()} onDelete={vi.fn()} />);
  expect(screen.getByText('Learn React')).toBeInTheDocument();
  expect(screen.getByText('HIGH')).toBeInTheDocument();
  expect(screen.getByText(/15\/7/)).toBeInTheDocument();
});
```

---

### TC-F-002: TaskCard — Hoàn thành task

```typescript
test('calls onComplete when checkbox is clicked', async () => {
  const onComplete = vi.fn();
  render(<TaskCard task={mockTask} onComplete={onComplete} ... />);
  await userEvent.click(screen.getByRole('checkbox'));
  expect(onComplete).toHaveBeenCalledWith(mockTask.id);
});
```

---

### TC-F-003: TaskCard — Done task có gạch ngang

```typescript
test('shows strikethrough for done tasks', () => {
  const task = { ...mockTask, status: 'done' };
  render(<TaskCard task={task} ... />);
  expect(screen.getByText(task.title)).toHaveStyle('text-decoration: line-through');
});
```

---

### TC-F-004: TaskForm — Validation title rỗng

```typescript
test('shows error when title is empty on submit', async () => {
  render(<TaskForm onSubmit={vi.fn()} />);
  await userEvent.click(screen.getByRole('button', { name: /lưu/i }));
  expect(screen.getByText(/title is required/i)).toBeInTheDocument();
});
```

---

### TC-F-005: ProgressBar — Render đúng width

```typescript
test('renders progress bar with correct width', () => {
  render(<ProgressBar value={60} max={100} />);
  const fill = document.querySelector('.progress-fill');
  expect(fill).toHaveStyle('width: 60%');
});
```

---

### TC-F-006: HabitCard — Hiển thị streak

```typescript
test('displays streak count', () => {
  render(<HabitCard habit={{ ...mockHabit, streak: 7 }} ... />);
  expect(screen.getByText('7')).toBeInTheDocument();
  expect(screen.getByText(/ngày liên tiếp/i)).toBeInTheDocument();
});
```

---

### TC-F-007: CountdownCard — Hiển thị số ngày đúng

```typescript
test('shows days remaining correctly', () => {
  // daysRemaining = 10
  render(<CountdownCard countdown={{ ...mockCountdown, daysRemaining: 10 }} />);
  expect(screen.getByText('10')).toBeInTheDocument();
  expect(screen.getByText(/ngày nữa/i)).toBeInTheDocument();
});

test('shows "Hôm nay!" when daysRemaining = 0', () => {
  render(<CountdownCard countdown={{ ...mockCountdown, daysRemaining: 0 }} />);
  expect(screen.getByText(/hôm nay/i)).toBeInTheDocument();
});
```

---

### TC-F-008: ThemeToggle — Chuyển theme

```typescript
test('toggles theme on click', async () => {
  render(<ThemeToggle />);
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  await userEvent.click(screen.getByRole('button'));
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
});
```

---

### TC-F-009: useTasks hook — Trả về data từ API

```typescript
test('fetches and returns tasks', async () => {
  server.use(http.get('/api/v1/tasks', () => HttpResponse.json({ data: [mockTask], total: 1 })));
  const { result } = renderHook(() => useTasks(), { wrapper: QueryWrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.data).toHaveLength(1);
});
```

---

### TC-F-010: SearchPage — Debounce query

```typescript
test('does not search on every keystroke', async () => {
  const searchFn = vi.fn();
  render(<SearchPage />);
  await userEvent.type(screen.getByRole('searchbox'), 'react');
  // Chờ 400ms — sau debounce 300ms
  await waitFor(() => expect(searchFn).toHaveBeenCalledTimes(1), { timeout: 500 });
});
```

---

## 6. Test Cases — E2E Tests (Playwright)

### TC-E-001: Happy Path — Tạo và hoàn thành task

```
1. Mở http://localhost:5173
2. Click "Todo Management" trên sidebar
3. Click nút "Thêm nhiệm vụ"
4. Nhập title = "E2E Test Task", priority = "High"
5. Click "Lưu"
6. Verify: Task xuất hiện trong danh sách
7. Click checkbox của task
8. Verify: Task có gạch ngang; Dashboard counter cập nhật
```

---

### TC-E-002: Tomorrow Planning — Auto-import

```
1. Mở "Tomorrow Planning"
2. Thêm task "Ngày mai task"
3. Giả lập sang ngày mới (mock date hoặc chờ thực tế)
4. Reload ứng dụng
5. Verify: "Ngày mai task" xuất hiện trong danh sách Todo hôm nay
```

---

### TC-E-003: Habit Tracker — Check-in và Streak

```
1. Vào "Habit Tracker"
2. Tạo habit mới: "Đọc sách", Daily
3. Tick "Hoàn thành hôm nay"
4. Verify: Streak hiển thị "1 ngày liên tiếp"
5. (Ngày tiếp theo) Tick lại
6. Verify: Streak = 2
```

---

### TC-E-004: Calendar — Điều hướng và Daily Detail

```
1. Vào "Calendar"
2. Click tháng trước 2 lần
3. Verify: Lịch hiển thị đúng tháng
4. Click vào ngày 15
5. Verify: Trang Daily Detail mở với URL /calendar/YYYY-MM-15
6. Verify: Hiển thị đúng thông tin ngày 15
```

---

### TC-E-005: Stopwatch — Record phiên

```
1. Vào "Stopwatch"
2. Click "Bắt đầu"
3. Chờ 3 giây
4. Click "Dừng"
5. Verify: Thời gian hiển thị ≥ 3 giây
6. Nhập label "Test session"
7. Click "Lưu"
8. Vào Daily Detail hôm nay
9. Verify: Focus session xuất hiện với label "Test session"
```

---

### TC-E-006: Settings — Đổi theme

```
1. Vào "Settings"
2. Click toggle "Dark → Light"
3. Verify: Background của trang thay đổi sang màu sáng
4. Reload trang
5. Verify: Theme vẫn là Light (lưu localStorage)
```

---

### TC-E-007: Backup và Restore

```
1. Tạo 3 tasks, 1 habit
2. Vào Settings → Backup → Click "Xuất dữ liệu"
3. Verify: File JSON được tải xuống
4. Xóa tất cả tasks
5. Settings → Restore → Chọn file backup
6. Xác nhận
7. Verify: 3 tasks được khôi phục
```

---

### TC-E-008: Search — Tìm kiếm task

```
1. Tạo task "Học TypeScript"
2. Click thanh Search
3. Gõ "TypeScript"
4. Verify: Kết quả hiện "Học TypeScript" dưới nhóm Tasks
5. Click kết quả
6. Verify: Chuyển sang trang Todo Management, task được highlight
```

---

### TC-E-009: Countdown Board

```
1. Vào Countdown
2. Click "Thêm" → Nhập "Bảo vệ đồ án", ngày = 30 ngày sau
3. Lưu
4. Verify: Card hiển thị "30 ngày nữa"
5. Vào Dashboard
6. Verify: Countdown widget hiển thị sự kiện này
```

---

### TC-E-010: Yearly Heatmap — Hiển thị đúng

```
1. Tạo 5 tasks và complete trong ngày hôm nay
2. Vào Analytics → Yearly
3. Verify: Ô ngày hôm nay có màu đậm hơn (intensity > 0)
4. Hover vào ô đó
5. Verify: Tooltip hiện số task, focus minutes, habit done
```

---

## 7. Non-Functional Tests

### TC-NFR-001: Thời gian khởi động

| | |
|--|--|
| **Điều kiện** | Ứng dụng chưa cache; DB có ~500 tasks |
| **Đo lường** | Thời gian từ khi mở URL đến khi Dashboard render xong |
| **Pass** | < 2 giây |

---

### TC-NFR-002: API response time

| | |
|--|--|
| **Test** | GET `/api/v1/tasks` với 1000 tasks trong DB |
| **Pass** | Response time < 500ms |

---

### TC-NFR-003: Heatmap render performance

| | |
|--|--|
| **Test** | Yearly heatmap với đủ 365 ngày dữ liệu |
| **Pass** | Render < 2 giây; Không có jank (FPS > 30) |

---

### TC-NFR-004: Offline operation

| | |
|--|--|
| **Test** | Tắt network adapter → Thao tác bình thường trên app |
| **Pass** | Mọi chức năng hoạt động (app chỉ cần localhost) |

---

### TC-NFR-005: Theme contrast ratio

| | |
|--|--|
| **Tool** | Chrome DevTools / axe |
| **Pass** | Text primary trên bg-surface ≥ 4.5:1 (WCAG AA) |

---

## 8. Test Data

### Seed Data cho Integration Tests

```sql
-- Tags
INSERT INTO tags VALUES (1,'Công việc','#E74C3C'), (2,'Học tập','#4A90E2');

-- Tasks
INSERT INTO tasks (title,priority,status,planned_date,created_at)
VALUES ('Task 1','high','pending','2026-07-11',NOW()),
       ('Task 2','medium','done','2026-07-11',NOW()),
       ('Task 3','low','pending',NULL,NOW());

-- Habits
INSERT INTO habits (name,frequency,is_active,created_at)
VALUES ('Đọc sách','daily',1,NOW());

-- Checkins (7 ngày liên tiếp)
INSERT INTO habit_checkins (habit_id,checkin_date,is_completed)
VALUES (1,CURDATE(),1),(1,CURDATE()-INTERVAL 1 DAY,1),
       (1,CURDATE()-INTERVAL 2 DAY,1),(1,CURDATE()-INTERVAL 3 DAY,1),
       (1,CURDATE()-INTERVAL 4 DAY,1),(1,CURDATE()-INTERVAL 5 DAY,1),
       (1,CURDATE()-INTERVAL 6 DAY,1);
```

---

## 9. Quy trình Báo cáo Lỗi

### Mức độ Lỗi

| Severity | Định nghĩa | SLA Fix |
|---------|-----------|---------|
| **Critical** | Crash app, mất dữ liệu, không khởi động được | Ngay lập tức |
| **High** | Tính năng chính không hoạt động | Trong sprint |
| **Medium** | Tính năng phụ sai, workaround có thể | Sprint tiếp theo |
| **Low** | UI glitch nhỏ, typo | Backlog |

### Bug Report Template

```markdown
**ID:** BUG-XXX
**Severity:** Critical / High / Medium / Low
**Module:** [Tên tính năng]
**Môi trường:** Development / Docker

**Mô tả:** [Mô tả ngắn]

**Bước tái hiện:**
1. ...
2. ...

**Kết quả thực tế:** ...
**Kết quả mong đợi:** ...

**Screenshot/Log:** [đính kèm]
```

---

## 10. Tóm tắt Test Coverage Target

| Layer | Target Coverage |
|-------|----------------|
| Backend Unit | ≥ 80% line coverage |
| Backend Integration | Tất cả API endpoints có ít nhất 1 happy path + 1 error case |
| Frontend Unit | ≥ 70% line coverage cho components |
| E2E | 10 happy path flows |
