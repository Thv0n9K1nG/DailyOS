# 03 - User Flow

## Actor

**User** — người dùng duy nhất tương tác với ứng dụng (local-first, không có tài khoản/đăng nhập).

---

## 1. Điểm vào & Cấu trúc Điều hướng

```
Khởi động App
    └─> Tải cơ sở dữ liệu (MySQL)
    └─> Hiển thị Dashboard (trang mặc định)
            ├─ Calendar           → Daily Detail
            ├─ Todo Management    → Task CRUD
            ├─ Tomorrow Planning  → Lên kế hoạch ngày mai
            ├─ Habit Tracker      → Check-in & Streak
            ├─ Stopwatch          → Focus Session (thủ công)
            ├─ Pomodoro Timer     → Focus Session (25/5)
            ├─ Goal Tracker       → Mục tiêu dài hạn
            ├─ Daily Notes        → Ghi chú ngày
            ├─ Mood Tracker       → Ghi nhận tâm trạng
            ├─ Analytics
            │      ├─ Weekly Dashboard
            │      ├─ Monthly Dashboard
            │      └─ Yearly Heatmap
            ├─ Statistics         → Biểu đồ thống kê
            ├─ Search             → Tìm kiếm toàn cục
            ├─ Countdown Board    → Đếm ngược sự kiện
            └─ Settings           → Cài đặt & Backup/Restore
```

---

## 2. Các Luồng Người Dùng Chi Tiết

### F-01: Khởi động Ứng dụng

```
Người dùng mở app
    → App kết nối MySQL / load dữ liệu local
    → Hiển thị Dashboard:
          - Tổng quan nhiệm vụ hôm nay
          - Tiến độ tuần
          - Bộ đếm ngược nổi bật (nếu có)
          - Quick-launch: Stopwatch / Pomodoro
          - Tóm tắt lịch
```

---

### F-02: Quản lý Nhiệm vụ (Todo Management)

```
Dashboard / Sidebar → Todo Management

[Tạo nhiệm vụ]
    Nhấn "Thêm" → Form (tiêu đề, mô tả, ưu tiên, deadline, tags)
    → Lưu → Danh sách cập nhật → Dashboard cập nhật

[Chỉnh sửa nhiệm vụ]
    Chọn task → Nhấn Edit → Sửa thông tin → Lưu

[Hoàn thành nhiệm vụ]
    Tick vào task → Trạng thái "Done"
    → Lịch sử hoàn thành được ghi lại
    → Dashboard & Statistics cập nhật

[Xóa / Lưu trữ nhiệm vụ]
    Chọn task → Xóa (xóa vĩnh viễn) hoặc Archive
```

---

### F-03: Lên kế hoạch Ngày mai (Tomorrow Planning)

```
Sidebar → Tomorrow Planning

    Xem danh sách nhiệm vụ đang lên kế hoạch cho ngày mai
    → Thêm nhiệm vụ mới cho ngày mai (tiêu đề, ưu tiên, deadline)
    → Hoặc kéo nhiệm vụ hiện có vào danh sách "Ngày mai"
    → Lưu kế hoạch

[Chuyển ngày]
    Khi sang ngày mới (00:00):
        → Nhiệm vụ ngày mai tự động được chuyển vào Todo hôm nay
        → Dashboard hiển thị danh sách đã import
```

---

### F-04: Xem Chi tiết Ngày (Daily Detail)

```
Calendar → Chọn ngày bất kỳ → Daily Detail

    Hiển thị:
        - Danh sách nhiệm vụ của ngày đó (đã hoàn thành / chưa)
        - Ghi chú ngày (Daily Notes)
        - Các phiên tập trung (Focus Sessions)
        - Trạng thái thói quen (Habits)
        - Tâm trạng (Mood)
        - Tổng thời gian tập trung
```

---

### F-05: Lịch (Calendar)

```
Sidebar → Calendar

    Hiển thị lịch theo tháng (Gregorian)
    → Điều hướng tháng trước / tháng sau
    → Mỗi ô ngày có indicator: số task, trạng thái habit
    → Nhấn vào ô ngày → Daily Detail (F-04)
    → Điều hướng nhanh đến năm bất kỳ (365-day navigation)
```

---

### F-06: Phiên Tập trung — Stopwatch

```
Dashboard (Quick Launch) hoặc Sidebar → Stopwatch

    → Nhấn "Bắt đầu" → Đồng hồ chạy
    → Nhấn "Dừng" → Hiển thị thời gian đã trôi qua
    → Gán nhãn phiên (tùy chọn: tên task / tag)
    → Nhấn "Lưu" → Phiên được ghi vào lịch sử
    → Statistics & Daily Detail cập nhật
    (Có thể nhấn "Hủy" để bỏ qua không lưu)
```

---

### F-07: Phiên Tập trung — Pomodoro Timer

```
Dashboard (Quick Launch) hoặc Sidebar → Pomodoro

    → Cài đặt thời gian Focus / Break (mặc định 25/5)
    → Nhấn "Bắt đầu"
    → Đếm ngược focus → Thông báo nghỉ → Đếm ngược break
    → Lặp lại đến khi hết số vòng
    → Kết thúc → Lưu phiên → Statistics cập nhật
```

---

### F-08: Theo dõi Thói quen (Habit Tracker)

```
Sidebar → Habit Tracker

[Tạo thói quen]
    Nhấn "Thêm" → Nhập tên, tần suất (ngày/tuần/tháng), icon
    → Lưu → Hiển thị trong danh sách

[Check-in hàng ngày]
    Chọn thói quen → Tick "Hoàn thành hôm nay"
    → Streak được cập nhật (+1)
    → Daily Detail & Dashboard cập nhật

[Bỏ lỡ một ngày]
    → Streak reset về 0 (hoặc grace period nếu cài đặt cho phép)
```

---

### F-09: Theo dõi Mục tiêu (Goal Tracker)

```
Sidebar → Goal Tracker

[Tạo mục tiêu]
    Nhấn "Thêm" → Nhập tiêu đề, mô tả, giá trị hiện tại, giá trị mục tiêu, đơn vị, deadline
    → Lưu → Hiển thị trong danh sách với progress bar

[Cập nhật tiến độ]
    Chọn mục tiêu → Nhập giá trị mới
    → Progress bar cập nhật → Nếu đạt 100% → Đánh dấu hoàn thành

[Xem tổng quan]
    Dashboard hiển thị các mục tiêu đang tiến hành
```

---

### F-10: Ghi chú Ngày (Daily Notes)

```
Sidebar → Daily Notes  /  hoặc từ Daily Detail

    Mỗi ngày có một ghi chú Markdown
    → Nhấn "Chỉnh sửa" → Soạn thảo Markdown
    → Lưu → Gắn với ngày đó
    → Có thể tìm kiếm nội dung ghi chú (F-16)
```

---

### F-11: Theo dõi Tâm trạng (Mood Tracker)

```
Dashboard hoặc Sidebar → Mood Tracker

    → Chọn emoji/điểm tâm trạng (1–5 hoặc icon)
    → Ghi chú ngắn (tùy chọn)
    → Lưu (1 lần/ngày; có thể chỉnh sửa trong ngày)
    → Hiển thị trong Daily Detail & biểu đồ Statistics
```

---

### F-12: Bảng phân tích Tuần (Weekly Dashboard)

```
Sidebar → Analytics → Weekly

    Hiển thị tuần hiện tại (có thể điều hướng tuần trước/sau):
        - Biểu đồ cột: số task hoàn thành mỗi ngày
        - Tổng thời gian focus
        - Tỉ lệ hoàn thành task
        - Streak thói quen
        - Mood trend
```

---

### F-13: Bảng phân tích Tháng (Monthly Dashboard)

```
Sidebar → Analytics → Monthly

    Hiển thị tháng hiện tại (điều hướng tháng trước/sau):
        - Calendar heat map (task count mỗi ngày)
        - Top thói quen trong tháng
        - Tổng focus hours
        - So sánh với tháng trước
```

---

### F-14: Heatmap Năm (Yearly Heatmap)

```
Sidebar → Analytics → Yearly

    GitHub-style heatmap — 365 ô (mỗi ô = 1 ngày):
        - Màu sắc theo cường độ hoạt động (task + habit + focus)
        - Hover vào ô → tooltip: số task, thời gian focus, streak
        - Điều hướng năm trước/sau
```

---

### F-15: Thống kê (Statistics)

```
Sidebar → Statistics

    Các biểu đồ tổng hợp:
        - Tasks hoàn thành theo thời gian (line/bar chart)
        - Tổng giờ tập trung (area chart)
        - Tỉ lệ hoàn thành (donut chart)
        - Streak dài nhất theo thói quen
        - Phân phối mood
        - Bộ lọc: 7 ngày / 30 ngày / 90 ngày / tùy chỉnh
```

---

### F-16: Tìm kiếm Toàn cục (Search)

```
Thanh tìm kiếm trên Header / Sidebar → Search

    → Nhập từ khóa
    → Kết quả hiển thị theo nhóm:
          - Tasks (tên, mô tả)
          - Daily Notes (nội dung)
          - Habits (tên)
          - Goals (tiêu đề)
    → Nhấn vào kết quả → Điều hướng đến mục tương ứng
```

---

### F-17: Tags

```
Khi tạo/chỉnh sửa Task:
    → Gán một hoặc nhiều tag (có thể tạo tag mới)
    → Tag hiển thị trên card task

Lọc theo Tag:
    Todo Management → Bộ lọc → Chọn tag → Danh sách lọc theo tag
    Search → Tìm theo tag
```

---

### F-18: Nhiệm vụ Lặp lại (Recurring Tasks)

```
Khi tạo Task → Bật "Lặp lại"
    → Chọn tần suất: Hàng ngày / Hàng tuần / Hàng tháng
    → Lưu

[Hành vi tự động]
    → Mỗi chu kỳ tạo một instance mới của task
    → Hoàn thành instance không ảnh hưởng đến chu kỳ tiếp theo
    → Có thể dừng / chỉnh sửa chuỗi lặp
```

---

### F-19: Sao lưu & Khôi phục (Backup / Restore)

```
Sidebar → Settings → Backup & Restore

[Backup]
    → Nhấn "Xuất dữ liệu"
    → Chọn thư mục lưu
    → File backup (.sql / .json) được tạo

[Restore]
    → Nhấn "Nhập dữ liệu"
    → Chọn file backup
    → Xác nhận ghi đè
    → Dữ liệu được khôi phục → App reload
```

---

### F-20: Cài đặt (Settings)

```
Sidebar → Settings

    - Chọn giao diện: Dark / Light theme
    - Ngôn ngữ (nếu hỗ trợ)
    - Cài đặt Pomodoro (thời gian focus, break, số vòng)
    - Cài đặt Habit (grace period)
    - Quản lý Tags (thêm/sửa/xóa)
    - Backup & Restore (F-19)
    - Thông tin phiên bản
```

---

### F-21: Bảng Đếm ngược (Countdown Board)

```
Dashboard → Countdown Board  /  Sidebar → Countdown

[Thêm sự kiện đếm ngược]
    → Nhấn "Thêm" → Nhập tiêu đề, ngày mục tiêu, icon/màu
    → Lưu → Hiển thị trên Countdown Board

[Hiển thị]
    → Mỗi card: Tiêu đề + số ngày còn lại (hoặc "Hôm nay!" / "Đã qua X ngày")
    → Dashboard luôn hiển thị các sự kiện gần nhất
    → Sắp xếp theo thứ tự ngày đến gần nhất

[Quản lý]
    → Chỉnh sửa / Xóa sự kiện
```

---

## 3. Luồng Trạng thái Nhiệm vụ

```
[Tạo mới] ──→ [Chờ xử lý] ──→ [Hoàn thành]
                    │
                    └──→ [Lưu trữ / Xóa]
```

---

## 4. Tóm tắt Luồng Nhanh

| # | Luồng | Bắt đầu từ | Kết thúc tại |
|---|-------|-----------|-------------|
| F-01 | Khởi động | Mở app | Dashboard |
| F-02 | Task CRUD | Todo Management | Danh sách / History |
| F-03 | Tomorrow Planning | Tomorrow Planning | Auto-import ngày mai |
| F-04 | Daily Detail | Calendar → chọn ngày | Xem chi tiết ngày |
| F-05 | Calendar | Sidebar | Điều hướng ngày |
| F-06 | Stopwatch | Dashboard / Sidebar | Session lưu lại |
| F-07 | Pomodoro | Dashboard / Sidebar | Session lưu lại |
| F-08 | Habit Check-in | Habit Tracker | Streak cập nhật |
| F-09 | Goal Update | Goal Tracker | Progress bar cập nhật |
| F-10 | Daily Notes | Daily Notes / Daily Detail | Markdown lưu theo ngày |
| F-11 | Mood | Dashboard / Sidebar | Mood lưu cho ngày |
| F-12 | Weekly Analytics | Analytics → Weekly | Xem biểu đồ tuần |
| F-13 | Monthly Analytics | Analytics → Monthly | Xem heatmap tháng |
| F-14 | Yearly Heatmap | Analytics → Yearly | Xem 365 ngày |
| F-15 | Statistics | Statistics | Xem charts tổng hợp |
| F-16 | Search | Header / Sidebar | Điều hướng kết quả |
| F-17 | Tags | Task form | Lọc theo tag |
| F-18 | Recurring Task | Task form → Lặp lại | Auto-create theo chu kỳ |
| F-19 | Backup/Restore | Settings | File xuất / dữ liệu khôi phục |
| F-20 | Settings | Settings | Áp dụng cài đặt |
| F-21 | Countdown | Dashboard / Sidebar | Card đếm ngược hiển thị |
