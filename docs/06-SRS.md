# 06 - Software Requirements Specification (SRS)

**Dự án:** LifeBoard — Personal Productivity System
**Phiên bản:** 1.0
**Ngày:** 2026-07-10
**Tham chiếu:** IEEE 830-1998

---

## 1. Giới thiệu

### 1.1 Mục đích

Tài liệu này mô tả đầy đủ các yêu cầu phần mềm của hệ thống LifeBoard — một ứng dụng web quản lý năng suất cá nhân hoạt động offline (local-first). Tài liệu phục vụ làm cơ sở thiết kế, phát triển và kiểm thử.

### 1.2 Phạm vi

LifeBoard là ứng dụng web đơn người dùng, chạy hoàn toàn cục bộ. Hệ thống bao gồm:
- Frontend: React + TypeScript + Vite
- Backend: ASP.NET Core 8 Web API
- Database: MySQL (local)
- Triển khai tùy chọn: Docker Compose

Hệ thống **không** bao gồm: đồng bộ cloud, cộng tác nhóm, ứng dụng di động, AI scheduling.

### 1.3 Định nghĩa & Viết tắt

| Ký hiệu | Ý nghĩa |
|---------|---------|
| FR | Functional Requirement — Yêu cầu chức năng |
| NFR | Non-Functional Requirement — Yêu cầu phi chức năng |
| UC | Use Case |
| PB | Product Backlog Item |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| SPA | Single Page Application |

### 1.4 Tài liệu tham chiếu

- `01-Vision.md` — Tầm nhìn sản phẩm
- `02-Product-Backlog.md` — Danh sách tính năng
- `03-User-Flow.md` — Luồng người dùng
- `04-Use-Case.md` — Use Cases chi tiết
- `05-Domain-Model.md` — Mô hình miền

---

## 2. Mô tả Tổng quan

### 2.1 Bối cảnh Sản phẩm

LifeBoard thay thế các bảng tính Excel/Google Sheets mà người dùng thường dùng để lập kế hoạch cá nhân. Không yêu cầu internet, không đăng ký tài khoản, toàn bộ dữ liệu nằm trên máy người dùng.

```
[Browser (React SPA)] <──HTTP──> [ASP.NET Core 8 API] <──> [MySQL Local]
```

### 2.2 Chức năng Tổng quát

| Nhóm | Tính năng |
|------|----------|
| Task Management | Tạo, sửa, xóa, hoàn thành, lưu trữ task; gán tag; recurring tasks |
| Planning | Dashboard hôm nay, Tomorrow Planning |
| Calendar | Duyệt lịch 365 ngày, Daily Detail |
| Focus Tracking | Stopwatch, Pomodoro Timer |
| Habit Tracking | Tạo thói quen, check-in hàng ngày, tính streak |
| Goal Tracking | Mục tiêu dài hạn với progress bar |
| Journaling | Daily Notes (Markdown), Mood Tracker |
| Analytics | Weekly/Monthly/Yearly dashboard, Statistics, Heatmap |
| Utilities | Search toàn cục, Tags, Countdown Board |
| System | Settings, Backup/Restore |

### 2.3 Người dùng

**User:** Người dùng cá nhân duy nhất, không cần đăng nhập. Có toàn quyền với mọi dữ liệu.

### 2.4 Ràng buộc Chung

- Chạy offline hoàn toàn sau khi cài đặt
- Dữ liệu lưu trên máy local (MySQL)
- Khởi động dưới 2 giây
- Hỗ trợ Dark/Light theme

---

## 3. Yêu cầu Chức năng (Functional Requirements)

---

### FR-001: Khởi động Ứng dụng
**PB Ref:** PB-001 | **UC Ref:** UC-001

| | |
|--|--|
| **Mô tả** | Ứng dụng tải và hiển thị Dashboard sau khi kết nối cơ sở dữ liệu thành công |
| **Đầu vào** | Người dùng mở trình duyệt tại địa chỉ local |
| **Xử lý** | Backend kiểm tra kết nối MySQL; System kiểm tra recurring tasks cần tạo; System auto-import Tomorrow Planning nếu sang ngày mới |
| **Đầu ra** | Dashboard hiển thị đầy đủ dữ liệu ngày hiện tại |
| **Điều kiện lỗi** | Không kết nối được MySQL → hiển thị thông báo lỗi rõ ràng |

---

### FR-002: Xem Dashboard
**PB Ref:** PB-001 | **UC Ref:** UC-028

| | |
|--|--|
| **Mô tả** | Dashboard là trang mặc định, tổng hợp thông tin quan trọng nhất trong ngày |
| **Hiển thị bắt buộc** | (1) Danh sách task hôm nay với số đã hoàn thành / tổng; (2) Tỉ lệ hoàn thành tuần; (3) Countdown sự kiện gần nhất; (4) Quick-launch Stopwatch/Pomodoro; (5) Tóm tắt lịch tháng; (6) Mục tiêu đang tiến hành |
| **Điều hướng** | Mỗi widget có thể nhấn để chuyển sang trang chi tiết tương ứng |

---

### FR-003: Tạo Nhiệm vụ
**PB Ref:** PB-003 | **UC Ref:** UC-002

| | |
|--|--|
| **Mô tả** | Người dùng tạo một nhiệm vụ mới |
| **Trường bắt buộc** | `title` (không rỗng, tối đa 255 ký tự) |
| **Trường tùy chọn** | `description`, `priority` (low/medium/high, mặc định medium), `deadline` (datetime), `tags`, `plannedDate` |
| **Xử lý** | System lưu task với `status = pending`, `createdAt = NOW()` |
| **Validation** | `title` không được rỗng; `deadline` phải là ngày hợp lệ nếu cung cấp |
| **Đầu ra** | Task xuất hiện trong danh sách; Dashboard cập nhật counter |

---

### FR-004: Chỉnh sửa Nhiệm vụ
**PB Ref:** PB-003 | **UC Ref:** UC-003

| | |
|--|--|
| **Mô tả** | Người dùng chỉnh sửa thông tin task đã tạo |
| **Điều kiện** | Task tồn tại và không ở trạng thái `archived` |
| **Xử lý** | System cập nhật các trường được thay đổi, ghi `updatedAt = NOW()` |
| **Validation** | Các ràng buộc tương tự FR-003 |

---

### FR-005: Hoàn thành Nhiệm vụ
**PB Ref:** PB-003 | **UC Ref:** UC-004

| | |
|--|--|
| **Mô tả** | Đánh dấu task là hoàn thành |
| **Xử lý** | `status = done`, `completedAt = NOW()` |
| **Đầu ra** | Task hiển thị gạch ngang / chuyển vùng "Đã hoàn thành"; Dashboard cập nhật tiến độ; Statistics cập nhật |
| **Hoàn tác** | Người dùng có thể bỏ tick để chuyển task về `pending` |

---

### FR-006: Xóa / Lưu trữ Nhiệm vụ
**PB Ref:** PB-003 | **UC Ref:** UC-005

| | |
|--|--|
| **Xóa** | Xóa vĩnh viễn khỏi DB sau khi xác nhận |
| **Lưu trữ** | `status = archived` — task ẩn khỏi danh sách chính nhưng vẫn trong DB |

---

### FR-007: Lên kế hoạch Ngày mai
**PB Ref:** PB-005 | **UC Ref:** UC-006

| | |
|--|--|
| **Mô tả** | Người dùng lên kế hoạch task cho ngày hôm sau |
| **Xử lý tạo** | Task được tạo với `plannedDate = ngày mai` |
| **Auto-import** | Khi ứng dụng khởi động vào một ngày mới, System tìm tất cả task có `plannedDate = hôm nay` và `status = pending` → giữ nguyên (đã là task hôm nay) |
| **Điều kiện** | Tính năng auto-import chỉ chạy một lần mỗi ngày |

---

### FR-008: Duyệt Lịch
**PB Ref:** PB-002 | **UC Ref:** UC-008

| | |
|--|--|
| **Mô tả** | Hiển thị lịch Gregorian đúng chuẩn, cho phép điều hướng 365 ngày |
| **Hiển thị ô ngày** | Số task trong ngày (chấm indicator); trạng thái habit (màu sắc) |
| **Điều hướng** | Tháng trước/sau; jump đến tháng/năm cụ thể |
| **Tương tác** | Nhấn vào ngày → Daily Detail (FR-009) |

---

### FR-009: Xem Daily Detail
**PB Ref:** PB-004 | **UC Ref:** UC-007

| | |
|--|--|
| **Mô tả** | Tổng hợp toàn bộ hoạt động của một ngày cụ thể |
| **Nội dung** | Danh sách task (done/pending); Focus sessions; Habit check-ins; Daily Notes; Mood; Tổng thời gian focus |
| **Chỉnh sửa** | Có thể check-in habit, xem/sửa ghi chú từ trang này |

---

### FR-010: Stopwatch
**PB Ref:** PB-006 | **UC Ref:** UC-009

| | |
|--|--|
| **Mô tả** | Đồng hồ bấm giờ để đo phiên làm việc |
| **Điều khiển** | Start / Stop / Reset / Save / Cancel |
| **Lưu phiên** | `sessionType = stopwatch`, `startTime`, `endTime`, `durationSeconds`, `label` (tùy chọn) |
| **Validation** | `durationSeconds > 0` mới cho phép lưu |

---

### FR-011: Pomodoro Timer
**PB Ref:** PB-007 | **UC Ref:** UC-010

| | |
|--|--|
| **Mô tả** | Đếm ngược theo kỹ thuật Pomodoro |
| **Cấu hình** | Focus (phút), Break (phút), số vòng — đọc từ Settings |
| **Luồng** | Focus → thông báo → Break → lặp lại |
| **Lưu phiên** | Mỗi vòng focus hoàn chỉnh tạo một FocusSession (`sessionType = pomodoro`) |
| **Thông báo** | Âm thanh / visual alert khi chuyển giai đoạn |

---

### FR-012: Quản lý Thói quen
**PB Ref:** PB-008 | **UC Ref:** UC-012

| | |
|--|--|
| **Tạo** | `name` (bắt buộc), `frequency` (daily/weekly/monthly), `icon`, `color` |
| **Chỉnh sửa / Xóa** | Cho phép sửa tên, icon, màu; xóa kéo theo xóa toàn bộ lịch sử check-in |
| **Tạm dừng** | `isActive = false` → ẩn khỏi daily check-in |

---

### FR-013: Check-in Thói quen
**PB Ref:** PB-008 | **UC Ref:** UC-011

| | |
|--|--|
| **Mô tả** | Đánh dấu hoàn thành một thói quen trong ngày |
| **Xử lý** | Tạo hoặc cập nhật `HabitCheckIn` cho `(habitId, hôm nay)` |
| **Streak** | Tính động: đếm ngược từ hôm nay số ngày liên tiếp có `isCompleted = true` |
| **Grace period** | Nếu `habitGracePeriodDays > 0`, bỏ lỡ ≤ N ngày không reset streak |

---

### FR-014: Goal Tracker
**PB Ref:** PB-009 | **UC Ref:** UC-013, UC-014

| | |
|--|--|
| **Tạo** | `title`, `targetValue`, `unit` (bắt buộc); `description`, `deadline`, `currentValue` (tùy chọn) |
| **Cập nhật** | Nhập `currentValue` mới → progress % tự tính |
| **Hoàn thành tự động** | Khi `currentValue >= targetValue` → `status = completed` |
| **Hiển thị** | Progress bar trực quan; Dashboard widget |

---

### FR-015: Daily Notes
**PB Ref:** PB-010 | **UC Ref:** UC-015

| | |
|--|--|
| **Mô tả** | Ghi chú Markdown cho từng ngày |
| **Ràng buộc** | Mỗi ngày chỉ có một ghi chú (UNIQUE theo `noteDate`) |
| **Editor** | Hỗ trợ Markdown; preview mode |
| **Tìm kiếm** | Nội dung ghi chú có thể tìm kiếm qua FR-022 |

---

### FR-016: Mood Tracker
**PB Ref:** PB-011 | **UC Ref:** UC-016

| | |
|--|--|
| **Mô tả** | Ghi nhận tâm trạng người dùng một lần mỗi ngày |
| **Đầu vào** | `score` (1–5 hoặc emoji tương ứng), `note` (tùy chọn, tối đa 500 ký tự) |
| **Ràng buộc** | Mỗi ngày chỉ có một bản ghi (UNIQUE theo `entryDate`); có thể chỉnh sửa trong ngày |

---

### FR-017: Weekly Dashboard
**PB Ref:** PB-012 | **UC Ref:** UC-017

| | |
|--|--|
| **Mô tả** | Phân tích hiệu suất theo tuần |
| **Nội dung** | Bar chart task/ngày; Tổng focus hours; Tỉ lệ hoàn thành; Streak thói quen; Mood trend |
| **Điều hướng** | Tuần trước / tuần sau |

---

### FR-018: Monthly Dashboard
**PB Ref:** PB-013 | **UC Ref:** UC-018

| | |
|--|--|
| **Mô tả** | Phân tích hiệu suất theo tháng |
| **Nội dung** | Calendar heatmap; Top habits; Tổng focus hours; So sánh tháng trước |
| **Điều hướng** | Tháng trước / tháng sau |

---

### FR-019: Yearly Heatmap
**PB Ref:** PB-014 | **UC Ref:** UC-019

| | |
|--|--|
| **Mô tả** | Hiển thị 365 ô theo GitHub-style heatmap |
| **Màu sắc** | Cường độ theo tổng hoạt động (task + habit + focus) mỗi ngày |
| **Tooltip** | Hover → hiển thị: ngày, số task, focus hours, habit streak |
| **Điều hướng** | Năm trước / năm sau |

---

### FR-020: Statistics
**PB Ref:** PB-015 | **UC Ref:** UC-020

| | |
|--|--|
| **Biểu đồ** | (1) Tasks theo thời gian (line chart); (2) Focus hours (area chart); (3) Completion rate (donut); (4) Streak dài nhất; (5) Mood distribution |
| **Bộ lọc** | 7 ngày / 30 ngày / 90 ngày / tùy chỉnh khoảng ngày |

---

### FR-021: Search
**PB Ref:** PB-016 | **UC Ref:** UC-021

| | |
|--|--|
| **Phạm vi** | Tasks (title, description); Daily Notes (content); Habits (name); Goals (title) |
| **Kết quả** | Phân nhóm theo loại; Highlight từ khóa tìm kiếm |
| **Điều hướng** | Nhấn kết quả → chuyển tới trang chứa mục đó |
| **Hiệu năng** | Kết quả xuất hiện khi người dùng gõ (debounce 300ms) |

---

### FR-022: Tags
**PB Ref:** PB-017 | **UC Ref:** UC-022

| | |
|--|--|
| **Tạo tag** | `name` (unique, tối đa 50 ký tự), `color` (HEX) |
| **Gán tag** | Một task có thể có nhiều tag; gán/gỡ trong form tạo/sửa task |
| **Lọc** | Todo Management có thể lọc theo tag |
| **Xóa tag** | Tự động gỡ khỏi tất cả task |

---

### FR-023: Recurring Tasks
**PB Ref:** PB-018 | **UC Ref:** UC-023

| | |
|--|--|
| **Cấu hình** | `isRecurring = true`, `recurrenceType` (daily/weekly/monthly), `recurrenceEndDate` (tùy chọn) |
| **Auto-create** | System tạo instance mới vào đầu mỗi chu kỳ |
| **Instance** | Mỗi instance là task độc lập (`parentTaskId` trỏ về task gốc) |
| **Quản lý** | Người dùng có thể dừng chuỗi lặp, sửa chuỗi, xóa instance riêng lẻ |

---

### FR-024: Backup
**PB Ref:** PB-019 | **UC Ref:** UC-024

| | |
|--|--|
| **Mô tả** | Xuất toàn bộ dữ liệu thành file |
| **Định dạng** | SQL dump hoặc JSON export |
| **Tên file** | Tự động thêm timestamp: `lifeboard_backup_YYYYMMDD_HHmmss.sql` |
| **Thư mục** | Người dùng chọn nơi lưu |

---

### FR-025: Restore
**PB Ref:** PB-019 | **UC Ref:** UC-025

| | |
|--|--|
| **Mô tả** | Nhập file backup để khôi phục dữ liệu |
| **Validation** | Kiểm tra format file hợp lệ trước khi ghi đè |
| **Cảnh báo** | Hiển thị xác nhận: "Dữ liệu hiện tại sẽ bị xóa và thay thế" |
| **Sau khôi phục** | App tự reload |

---

### FR-026: Settings
**PB Ref:** PB-020 | **UC Ref:** UC-026

| | |
|--|--|
| **Theme** | Light / Dark — áp dụng ngay lập tức, không cần reload |
| **Pomodoro** | Focus (phút), Break (phút), số vòng |
| **Habit** | Grace period (ngày) |
| **Ngôn ngữ** | Lựa chọn ngôn ngữ giao diện |
| **Tags** | Quản lý danh sách tags (tạo/sửa/xóa) |

---

### FR-027: Countdown Board
**PB Ref:** PB-021 | **UC Ref:** UC-027

| | |
|--|--|
| **Tạo** | `title` (bắt buộc), `targetDate` (bắt buộc), `icon`, `color` |
| **Hiển thị** | Số ngày còn lại / "Hôm nay!" / "Đã qua X ngày" |
| **Sắp xếp** | Theo thứ tự ngày gần nhất trước |
| **Dashboard** | Hiển thị tối đa 3 sự kiện gần nhất |

---

## 4. Yêu cầu Phi chức năng (Non-Functional Requirements)

### NFR-001: Hiệu năng

| ID | Yêu cầu | Mức chấp nhận |
|----|---------|--------------|
| NFR-001.1 | Thời gian khởi động ứng dụng | < 2 giây |
| NFR-001.2 | Thời gian phản hồi API thông thường | < 500ms |
| NFR-001.3 | Thời gian render danh sách task (< 1000 items) | < 1 giây |
| NFR-001.4 | Thời gian tính toán Statistics / Heatmap | < 2 giây |
| NFR-001.5 | Search debounce | 300ms |

---

### NFR-002: Khả dụng & Độ tin cậy

| ID | Yêu cầu |
|----|---------|
| NFR-002.1 | Hệ thống hoạt động hoàn toàn offline sau khi cài đặt |
| NFR-002.2 | Không mất dữ liệu khi đóng trình duyệt đột ngột |
| NFR-002.3 | Auto-save khi chỉnh sửa (không yêu cầu nhấn Save thủ công cho một số tính năng) |
| NFR-002.4 | Backup/Restore đảm bảo toàn vẹn dữ liệu |

---

### NFR-003: Khả năng Sử dụng (Usability)

| ID | Yêu cầu |
|----|---------|
| NFR-003.1 | Giao diện responsive, hoạt động tốt ở độ phân giải 1280×720 trở lên |
| NFR-003.2 | Hỗ trợ Dark/Light theme |
| NFR-003.3 | Điều hướng không quá 3 click để đến bất kỳ tính năng nào |
| NFR-003.4 | Tất cả form có validation rõ ràng và thông báo lỗi cụ thể |
| NFR-003.5 | Các thao tác nguy hiểm (xóa, restore) phải có bước xác nhận |

---

### NFR-004: Bảo mật & Quyền riêng tư

| ID | Yêu cầu |
|----|---------|
| NFR-004.1 | Không truyền bất kỳ dữ liệu người dùng lên internet |
| NFR-004.2 | API chỉ lắng nghe trên localhost |
| NFR-004.3 | Không có cơ chế đăng nhập/xác thực (single-user local app) |

---

### NFR-005: Khả năng Bảo trì

| ID | Yêu cầu |
|----|---------|
| NFR-005.1 | Frontend và Backend tách biệt hoàn toàn qua REST API |
| NFR-005.2 | Mỗi tính năng là một module độc lập có thể phát triển/test riêng |
| NFR-005.3 | Database migration được quản lý bằng migration scripts |
| NFR-005.4 | Code tuân thủ naming convention và có comment cho logic phức tạp |

---

### NFR-006: Khả năng Mở rộng

| ID | Yêu cầu |
|----|---------|
| NFR-006.1 | Kiến trúc cho phép thêm tính năng mới mà không phá vỡ tính năng cũ |
| NFR-006.2 | Schema database có thể migration lên phiên bản mới |
| NFR-006.3 | Cấu trúc API versioning sẵn sàng cho tương lai |

---

## 5. Ràng buộc Hệ thống

| Ràng buộc | Chi tiết |
|-----------|---------|
| **Ngôn ngữ lập trình** | TypeScript (Frontend), C# (Backend) |
| **Framework** | React 18+, ASP.NET Core 8 |
| **Database** | MySQL 8.0+ |
| **Build tool** | Vite (Frontend) |
| **Runtime** | Node.js 20+ (dev), .NET 8 Runtime (prod) |
| **Browser** | Chrome/Edge/Firefox phiên bản mới nhất |
| **OS** | Windows 10+ (development), cross-platform qua Docker |

---

## 6. Yêu cầu Giao diện Ngoài (External Interface Requirements)

### 6.1 Giao diện Người dùng

- SPA (Single Page Application) chạy trên trình duyệt
- Sidebar điều hướng cố định bên trái
- Header với thanh tìm kiếm toàn cục
- Responsive layout (min-width: 1280px)
- Font: Inter hoặc tương đương
- Animation: micro-animations cho transitions

### 6.2 Giao diện Phần mềm (API)

- RESTful API trên `http://localhost:5000/api/`
- Format: JSON
- Versioning: `/api/v1/...`
- HTTP Methods: GET, POST, PUT, PATCH, DELETE
- Error response format:
  ```json
  {
    "status": 400,
    "error": "Bad Request",
    "message": "Title is required"
  }
  ```

### 6.3 Giao diện Cơ sở dữ liệu

- MySQL 8.0+ chạy local (port 3306)
- Connection string cấu hình qua `appsettings.json`
- Migration tự động khi khởi động (nếu dùng EF Core Migrations)

---

## 7. Ma trận Truy vết Yêu cầu

| FR | PB Ref | UC Ref | Tính năng |
|----|--------|--------|----------|
| FR-001 | — | UC-001 | Khởi động ứng dụng |
| FR-002 | PB-001 | UC-028 | Dashboard |
| FR-003 | PB-003 | UC-002 | Tạo task |
| FR-004 | PB-003 | UC-003 | Sửa task |
| FR-005 | PB-003 | UC-004 | Hoàn thành task |
| FR-006 | PB-003 | UC-005 | Xóa/Archive task |
| FR-007 | PB-005 | UC-006 | Tomorrow Planning |
| FR-008 | PB-002 | UC-008 | Calendar |
| FR-009 | PB-004 | UC-007 | Daily Detail |
| FR-010 | PB-006 | UC-009 | Stopwatch |
| FR-011 | PB-007 | UC-010 | Pomodoro |
| FR-012 | PB-008 | UC-012 | Quản lý Habit |
| FR-013 | PB-008 | UC-011 | Habit Check-in |
| FR-014 | PB-009 | UC-013/014 | Goal Tracker |
| FR-015 | PB-010 | UC-015 | Daily Notes |
| FR-016 | PB-011 | UC-016 | Mood Tracker |
| FR-017 | PB-012 | UC-017 | Weekly Dashboard |
| FR-018 | PB-013 | UC-018 | Monthly Dashboard |
| FR-019 | PB-014 | UC-019 | Yearly Heatmap |
| FR-020 | PB-015 | UC-020 | Statistics |
| FR-021 | PB-016 | UC-021 | Search |
| FR-022 | PB-017 | UC-022 | Tags |
| FR-023 | PB-018 | UC-023 | Recurring Tasks |
| FR-024 | PB-019 | UC-024 | Backup |
| FR-025 | PB-019 | UC-025 | Restore |
| FR-026 | PB-020 | UC-026 | Settings |
| FR-027 | PB-021 | UC-027 | Countdown Board |
