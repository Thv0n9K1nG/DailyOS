# Phát triển LifeBoard — Timeline & Stages

Dựa trên tài liệu Product Backlog (21 features chia làm 3 Sprints) và codebase skeleton hiện tại (Vite React Frontend + ASP.NET Core Backend + MySQL), quá trình phát triển (Implementation Phase) được chia thành 5 giai đoạn (Stages) logic nhằm đảm bảo giá trị cốt lõi được build trước, sau đó mở rộng dần.

---

## Stage 1: Core Foundation & Task Management (Tương đương Sprint 1)

**Mục tiêu:**
Xây dựng nền tảng cốt lõi của ứng dụng xoay quanh việc quản lý công việc (Tasks), Lịch (Calendar) và trang tổng quan (Dashboard). Đây là trái tim của LifeBoard.

**Chi tiết Task:**
1. **Backend:**
   - Hoàn thiện `TaskRepository`, `TaskService` và `TasksController` (CRUD tasks, filter theo ngày, status).
   - Hoàn thiện `TagRepository`, `TagService` và `TagsController` (CRUD tags, gán tag cho task).
2. **Frontend:**
   - Setup TanStack Query hooks (ví dụ: `useTasks`, `useCreateTask`, `useUpdateTask`).
   - Xây dựng UI **Todo Management** (PB-003): Danh sách task, modal thêm/sửa task (hỗ trợ priority, deadline, tags).
   - Xây dựng UI **Calendar** (PB-002): Hiển thị lịch tháng, cho phép chọn ngày.
   - Xây dựng UI **Tomorrow Planning** (PB-005): Kéo thả/lên kế hoạch task cho ngày mai.
   - Xây dựng UI **Daily Detail** (PB-004): Hiển thị chi tiết các task trong một ngày cụ thể.
   - Xây dựng UI **Dashboard** (PB-001): Tổng hợp task hôm nay, hiển thị tóm tắt lịch.

**Definition of Done (DoD):**
- User có thể tạo, sửa, xóa, hoàn thành task và gán tag.
- User có thể điều hướng lịch và xem task theo từng ngày.
- Dashboard hiển thị đúng dữ liệu task của ngày hôm nay.
- Frontend gọi API backend thành công, dữ liệu lưu chuẩn xuống MySQL.

---

## Stage 2: Focus & Habits (Tương đương nửa đầu Sprint 2)

**Mục tiêu:**
Bổ sung các tính năng giúp người dùng tập trung (Focus) và xây dựng thói quen (Habits). Cấu hình ứng dụng (Settings) cũng được xây dựng ở giai đoạn này.

**Chi tiết Task:**
1. **Backend:**
   - Hoàn thiện `HabitRepository`, `HabitService` và `HabitsController` (CRUD habits, check-ins, tính streak).
   - Hoàn thiện `FocusSessionRepository`, `FocusSessionService` và `FocusSessionsController` (Lưu lịch sử focus).
   - Hoàn thiện `SettingsRepository`, `SettingsService` và `SettingsController`.
2. **Frontend:**
   - Xây dựng UI **Habit Tracker** (PB-008): Danh sách thói quen, nút check-in hàng ngày, hiển thị chuỗi (streak).
   - Xây dựng UI **Stopwatch** (PB-006) & **Pomodoro Timer** (PB-007): Bộ đếm thời gian, lưu kết quả khi hoàn thành.
   - Xây dựng UI **Settings** (PB-020): Cho phép đổi theme, tùy chỉnh thời gian Pomodoro, grace period cho habit.

**Definition of Done (DoD):**
- User có thể tạo thói quen và check-in hàng ngày; streak được tính toán chính xác.
- Timer (Stopwatch/Pomodoro) đếm đúng thời gian và lưu lại session sau khi kết thúc.
- Settings thay đổi được áp dụng ngay lập tức (ví dụ: chuyển đổi Light/Dark theme qua Zustand store).

---

## Stage 3: Analytics, Notes & Countdowns (Tương đương phần còn lại Sprint 2 & đầu Sprint 3)

**Mục tiêu:**
Giúp người dùng ghi chú hàng ngày, theo dõi các sự kiện quan trọng (Countdown) và xem thống kê tiến độ hàng tuần.

**Chi tiết Task:**
1. **Backend:**
   - Hoàn thiện `DailyNoteRepository`, `DailyNoteService`, `DailyNotesController`.
   - Hoàn thiện `MoodEntryRepository`, `MoodEntryService`, `MoodEntriesController`.
   - Hoàn thiện `CountdownRepository`, `CountdownService`, `CountdownsController`.
2. **Frontend:**
   - Xây dựng UI **Daily Notes** (PB-010) & **Mood Tracker** (PB-011): Tích hợp vào trang Daily Detail (Markdown editor cơ bản, chọn emoji tâm trạng).
   - Xây dựng UI **Date Countdown** (PB-021): Thêm widget đếm ngược ngày trên Dashboard hoặc trang riêng.
   - Xây dựng UI **Weekly Dashboard** (PB-012): Hiển thị biểu đồ hoàn thành task và focus time trong tuần.

**Definition of Done (DoD):**
- Mỗi ngày có thể lưu 1 ghi chú (Markdown) và 1 mức độ tâm trạng.
- Widget countdown đếm đúng số ngày còn lại đến sự kiện.
- Weekly Dashboard render biểu đồ trực quan, số liệu lấy từ backend chính xác.

---

## Stage 4: Advanced Features & Full Analytics (Tương đương Sprint 3)

**Mục tiêu:**
Hoàn thiện các tính năng nâng cao: theo dõi mục tiêu dài hạn, tìm kiếm toàn cục, task lặp lại và toàn bộ hệ thống thống kê chuyên sâu.

**Chi tiết Task:**
1. **Backend:**
   - Hoàn thiện `GoalRepository`, `GoalService`, `GoalsController`.
   - Hoàn thiện `SearchService`, `SearchController` (Full-text search cơ bản qua MySQL).
   - Triển khai logic **Recurring Tasks** (PB-018) vào `DailyTaskScheduler` (Background Service) để tự động tạo task lặp lại mỗi ngày.
   - Xây dựng các API tổng hợp dữ liệu cho Analytics.
2. **Frontend:**
   - Xây dựng UI **Goal Tracker** (PB-009): Danh sách mục tiêu, progress bar.
   - Xây dựng UI **Search** (PB-016): Thanh tìm kiếm toàn cục (Global search) tìm task, notes, habits.
   - Xây dựng UI **Monthly Dashboard** (PB-013), **Yearly Heatmap** (PB-014), và **Statistics** (PB-015): Sử dụng thư viện biểu đồ (ví dụ: Recharts hoặc Chart.js) để vẽ heatmap như GitHub và các biểu đồ phân tích.

**Definition of Done (DoD):**
- Tính năng tự động sinh task lặp lại (Daily/Weekly) hoạt động đúng vào 0h mỗi ngày.
- Tìm kiếm trả về kết quả nhanh, chính xác.
- Heatmap và các biểu đồ hiển thị đẹp mắt, scale tốt trên các thiết bị.

---

## Stage 5: Backup/Restore & Final Polish (Deployment & Testing)

**Mục tiêu:**
Đảm bảo tính toàn vẹn dữ liệu (Local-first requirement), sửa lỗi (bug bash) và chuẩn bị cho môi trường Production.

**Chi tiết Task:**
1. **Backend:**
   - Triển khai logic dump database MySQL và phục hồi từ file SQL trong `BackupService` và `BackupController` (PB-019).
2. **Frontend:**
   - Tích hợp tính năng Export/Import data trong trang Settings.
   - Polish UI: Căn chỉnh padding, margin, kiểm tra responsive, bổ sung loading states, error boundaries, empty states (đã có component stub).
3. **QA & DevOps:**
   - Chạy test (theo `11-Test-Plan.md`).
   - Kiểm tra log, error handling trên cả Frontend và Backend.
   - Xác nhận deployment qua Docker (`docker-compose up -d --build`) chạy mượt mà không lỗi.

**Definition of Done (DoD):**
- User có thể xuất toàn bộ dữ liệu ra một file zip/sql và phục hồi thành công.
- Không còn bug nghiêm trọng (P1/P2).
- Các component UI hiển thị hoàn hảo theo `10-UI-Guideline.md`.
- Sẵn sàng bàn giao hoặc release phiên bản 1.0.
