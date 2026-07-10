# 04 - Use Case

## Actors

| Actor | Mô tả |
|-------|-------|
| **User** | Người dùng duy nhất tương tác với hệ thống (local-first, không đăng nhập) |
| **System** | Hệ thống tự động xử lý nền (auto-import, recurring tasks, streak reset...) |

---

## Danh sách Use Case

| ID | Use Case | Actor | PB Ref |
|----|----------|-------|--------|
| UC-001 | Khởi động Ứng dụng | User, System | — |
| UC-002 | Tạo Nhiệm vụ | User | PB-003 |
| UC-003 | Chỉnh sửa Nhiệm vụ | User | PB-003 |
| UC-004 | Hoàn thành Nhiệm vụ | User | PB-003 |
| UC-005 | Xóa / Lưu trữ Nhiệm vụ | User | PB-003 |
| UC-006 | Lên kế hoạch Ngày mai | User, System | PB-005 |
| UC-007 | Xem Chi tiết Ngày | User | PB-004 |
| UC-008 | Duyệt Lịch | User | PB-002 |
| UC-009 | Bắt đầu Phiên Stopwatch | User | PB-006 |
| UC-010 | Bắt đầu Phiên Pomodoro | User | PB-007 |
| UC-011 | Check-in Thói quen | User | PB-008 |
| UC-012 | Tạo / Quản lý Thói quen | User | PB-008 |
| UC-013 | Tạo Mục tiêu Dài hạn | User | PB-009 |
| UC-014 | Cập nhật Tiến độ Mục tiêu | User | PB-009 |
| UC-015 | Ghi chú Ngày (Daily Notes) | User | PB-010 |
| UC-016 | Ghi nhận Tâm trạng | User | PB-011 |
| UC-017 | Xem Dashboard Tuần | User | PB-012 |
| UC-018 | Xem Dashboard Tháng | User | PB-013 |
| UC-019 | Xem Heatmap Năm | User | PB-014 |
| UC-020 | Xem Thống kê | User | PB-015 |
| UC-021 | Tìm kiếm Toàn cục | User | PB-016 |
| UC-022 | Quản lý Tags | User | PB-017 |
| UC-023 | Tạo Nhiệm vụ Lặp lại | User, System | PB-018 |
| UC-024 | Sao lưu Dữ liệu | User | PB-019 |
| UC-025 | Khôi phục Dữ liệu | User | PB-019 |
| UC-026 | Thay đổi Cài đặt | User | PB-020 |
| UC-027 | Quản lý Countdown | User | PB-021 |
| UC-028 | Xem Dashboard | User | PB-001 |

---

## Chi tiết Use Case

---

### UC-001: Khởi động Ứng dụng

- **Actor:** User, System
- **Điều kiện trước:** Ứng dụng chưa chạy
- **Luồng chính:**
  1. User mở ứng dụng
  2. System kết nối MySQL và tải dữ liệu
  3. System kiểm tra recurring tasks và auto-import Tomorrow Planning nếu sang ngày mới
  4. System hiển thị Dashboard với dữ liệu hôm nay
- **Điều kiện sau:** Dashboard hiển thị đầy đủ thông tin ngày hiện tại

---

### UC-002: Tạo Nhiệm vụ

- **Actor:** User
- **Điều kiện trước:** User đang ở màn hình Todo Management hoặc Dashboard
- **Luồng chính:**
  1. User nhấn nút "Thêm nhiệm vụ"
  2. System hiển thị form tạo task
  3. User nhập: tiêu đề (bắt buộc), mô tả, mức ưu tiên (Low/Medium/High), deadline, tags
  4. User nhấn "Lưu"
  5. System lưu task vào DB và cập nhật danh sách
- **Luồng thay thế:** User hủy → form đóng, không lưu
- **Điều kiện sau:** Task mới xuất hiện trong danh sách và trên Dashboard

---

### UC-003: Chỉnh sửa Nhiệm vụ

- **Actor:** User
- **Điều kiện trước:** Task tồn tại và chưa bị xóa
- **Luồng chính:**
  1. User chọn task → nhấn "Chỉnh sửa"
  2. System hiển thị form với dữ liệu hiện tại
  3. User thay đổi thông tin → nhấn "Lưu"
  4. System cập nhật DB và làm mới danh sách
- **Điều kiện sau:** Task được cập nhật

---

### UC-004: Hoàn thành Nhiệm vụ

- **Actor:** User
- **Điều kiện trước:** Task đang ở trạng thái chưa hoàn thành
- **Luồng chính:**
  1. User tick vào checkbox của task
  2. System đánh dấu task là "Done", ghi timestamp hoàn thành
  3. System cập nhật lịch sử, Dashboard và Statistics
- **Điều kiện sau:** Task chuyển sang trạng thái hoàn thành; Dashboard cập nhật tiến độ

---

### UC-005: Xóa / Lưu trữ Nhiệm vụ

- **Actor:** User
- **Điều kiện trước:** Task tồn tại
- **Luồng chính (Xóa):**
  1. User chọn task → nhấn "Xóa"
  2. System hiển thị xác nhận
  3. User xác nhận → System xóa vĩnh viễn khỏi DB
- **Luồng chính (Lưu trữ):**
  1. User chọn task → nhấn "Archive"
  2. System chuyển task sang trạng thái Archived (ẩn khỏi danh sách hoạt động)
- **Điều kiện sau:** Task bị xóa hoặc bị ẩn khỏi danh sách chính

---

### UC-006: Lên kế hoạch Ngày mai

- **Actor:** User, System
- **Điều kiện trước:** User đang ở màn hình Tomorrow Planning
- **Luồng chính:**
  1. User xem danh sách tasks đã lên kế hoạch cho ngày mai
  2. User thêm tasks mới hoặc kéo tasks hiện có vào danh sách
  3. User nhấn "Lưu kế hoạch"
  4. System lưu danh sách với ngày = ngày mai
- **Luồng tự động (System):**
  - Khi sang ngày mới (00:00 hoặc lần đầu mở app trong ngày mới):
    System tự động chuyển tasks "Tomorrow" thành tasks "Today"
- **Điều kiện sau:** Tasks xuất hiện trong danh sách Todo của ngày hôm sau

---

### UC-007: Xem Chi tiết Ngày

- **Actor:** User
- **Điều kiện trước:** User chọn một ngày trên Calendar
- **Luồng chính:**
  1. User nhấn vào một ô ngày trên Calendar
  2. System hiển thị trang Daily Detail cho ngày đó bao gồm:
     - Danh sách tasks (hoàn thành / chưa)
     - Daily Notes
     - Focus sessions
     - Habit check-ins
     - Mood của ngày
     - Tổng thời gian tập trung
- **Điều kiện sau:** User xem được toàn bộ thông tin của ngày đã chọn

---

### UC-008: Duyệt Lịch

- **Actor:** User
- **Điều kiện trước:** User mở trang Calendar
- **Luồng chính:**
  1. System hiển thị lịch tháng hiện tại (Gregorian)
  2. Mỗi ô ngày hiển thị: số task, trạng thái habit (indicator màu)
  3. User điều hướng tháng trước / tháng sau
  4. User nhấn vào ngày → UC-007
- **Luồng thay thế:** User điều hướng nhanh đến năm/tháng cụ thể
- **Điều kiện sau:** User xem được lịch và chọn ngày để xem chi tiết

---

### UC-009: Bắt đầu Phiên Stopwatch

- **Actor:** User
- **Điều kiện trước:** User mở Stopwatch
- **Luồng chính:**
  1. User nhấn "Bắt đầu"
  2. System chạy đồng hồ đếm lên
  3. User nhấn "Dừng"
  4. System dừng đồng hồ, hiển thị thời gian đã trôi qua
  5. User gán nhãn phiên (tùy chọn)
  6. User nhấn "Lưu"
  7. System lưu phiên vào DB, cập nhật Statistics và Daily Detail
- **Luồng thay thế:** User nhấn "Hủy" → phiên bị bỏ qua, không lưu
- **Điều kiện sau:** Phiên focus được ghi lại với thời gian và nhãn

---

### UC-010: Bắt đầu Phiên Pomodoro

- **Actor:** User
- **Điều kiện trước:** User mở Pomodoro Timer
- **Luồng chính:**
  1. User cài đặt thời gian Focus / Break (mặc định 25/5 phút) và số vòng
  2. User nhấn "Bắt đầu"
  3. System đếm ngược thời gian Focus → thông báo nghỉ → đếm ngược Break
  4. Lặp lại đến hết số vòng
  5. System tự động lưu phiên sau mỗi vòng hoàn thành
- **Luồng thay thế:** User dừng giữa chừng → System lưu phần thời gian đã hoàn thành
- **Điều kiện sau:** Phiên Pomodoro được ghi lại, Statistics cập nhật

---

### UC-011: Check-in Thói quen

- **Actor:** User
- **Điều kiện trước:** Thói quen đã được tạo, chưa check-in hôm nay
- **Luồng chính:**
  1. User mở Habit Tracker
  2. User tick "Hoàn thành" vào thói quen hôm nay
  3. System cập nhật streak (+1), ghi nhận ngày check-in
  4. Daily Detail và Dashboard cập nhật
- **Luồng thay thế:** User bỏ lỡ → streak reset về 0 (trừ khi có grace period)
- **Điều kiện sau:** Streak được cập nhật; lịch sử check-in ghi lại

---

### UC-012: Tạo / Quản lý Thói quen

- **Actor:** User
- **Luồng chính (Tạo):**
  1. User nhấn "Thêm thói quen"
  2. Nhập: tên, mô tả, tần suất (ngày/tuần/tháng), icon/màu
  3. Lưu → Thói quen xuất hiện trong danh sách
- **Luồng chỉnh sửa:** Chọn thói quen → Edit → Sửa → Lưu
- **Luồng xóa:** Chọn thói quen → Xóa → Xác nhận
- **Điều kiện sau:** Thói quen được tạo/cập nhật/xóa khỏi hệ thống

---

### UC-013: Tạo Mục tiêu Dài hạn

- **Actor:** User
- **Luồng chính:**
  1. User mở Goal Tracker → nhấn "Thêm mục tiêu"
  2. Nhập: tiêu đề, mô tả, giá trị hiện tại, giá trị mục tiêu, đơn vị, deadline
  3. Lưu → Goal xuất hiện với progress bar
- **Điều kiện sau:** Mục tiêu mới hiển thị trong danh sách với tiến độ ban đầu

---

### UC-014: Cập nhật Tiến độ Mục tiêu

- **Actor:** User
- **Luồng chính:**
  1. User chọn mục tiêu → nhấn "Cập nhật"
  2. Nhập giá trị mới
  3. System tính toán phần trăm hoàn thành, cập nhật progress bar
  4. Nếu đạt 100% → System đánh dấu mục tiêu là hoàn thành
- **Điều kiện sau:** Progress bar phản ánh tiến độ mới nhất

---

### UC-015: Ghi chú Ngày (Daily Notes)

- **Actor:** User
- **Điều kiện trước:** User truy cập Daily Notes (từ Sidebar hoặc Daily Detail)
- **Luồng chính:**
  1. System hiển thị ghi chú Markdown của ngày hiện tại (trống nếu chưa có)
  2. User nhấn "Chỉnh sửa" → soạn thảo nội dung Markdown
  3. User nhấn "Lưu"
  4. System gắn ghi chú với ngày đó trong DB
- **Luồng thay thế:** User chọn ngày khác từ Daily Detail → xem/sửa ghi chú ngày đó
- **Điều kiện sau:** Ghi chú được lưu và có thể tìm kiếm (UC-021)

---

### UC-016: Ghi nhận Tâm trạng

- **Actor:** User
- **Điều kiện trước:** User chưa ghi nhận tâm trạng hôm nay (hoặc muốn chỉnh sửa)
- **Luồng chính:**
  1. User mở Mood Tracker
  2. User chọn emoji hoặc điểm số tâm trạng (1–5)
  3. User nhập ghi chú ngắn (tùy chọn)
  4. User nhấn "Lưu"
  5. System lưu mood cho ngày, cập nhật Daily Detail và biểu đồ Statistics
- **Điều kiện sau:** Mood của ngày được ghi lại; có thể xem trong biểu đồ thống kê

---

### UC-017: Xem Dashboard Tuần

- **Actor:** User
- **Luồng chính:**
  1. User mở Analytics → Weekly
  2. System hiển thị dữ liệu tuần hiện tại:
     - Biểu đồ cột số task hoàn thành mỗi ngày
     - Tổng thời gian focus
     - Tỉ lệ hoàn thành task
     - Streak thói quen trong tuần
     - Mood trend
  3. User điều hướng sang tuần trước/sau
- **Điều kiện sau:** User nắm được hiệu suất trong tuần đã chọn

---

### UC-018: Xem Dashboard Tháng

- **Actor:** User
- **Luồng chính:**
  1. User mở Analytics → Monthly
  2. System hiển thị dữ liệu tháng hiện tại:
     - Calendar heatmap (intensity theo số task/ngày)
     - Top thói quen trong tháng
     - Tổng focus hours
     - So sánh với tháng trước
  3. User điều hướng sang tháng trước/sau
- **Điều kiện sau:** User xem được tổng quan tháng

---

### UC-019: Xem Heatmap Năm

- **Actor:** User
- **Luồng chính:**
  1. User mở Analytics → Yearly
  2. System hiển thị GitHub-style heatmap với 365 ô (mỗi ô = 1 ngày)
  3. Màu sắc thể hiện cường độ hoạt động (task + habit + focus)
  4. User hover vào ô → tooltip: số task, thời gian focus, streak
  5. User điều hướng năm trước/sau
- **Điều kiện sau:** User thấy được xu hướng hoạt động cả năm

---

### UC-020: Xem Thống kê

- **Actor:** User
- **Luồng chính:**
  1. User mở Statistics
  2. System hiển thị các biểu đồ:
     - Line/bar chart: task hoàn thành theo thời gian
     - Area chart: tổng giờ tập trung
     - Donut chart: tỉ lệ hoàn thành
     - Streak dài nhất theo từng thói quen
     - Phân phối mood
  3. User chọn bộ lọc thời gian: 7 / 30 / 90 ngày hoặc tùy chỉnh
  4. System cập nhật biểu đồ theo bộ lọc
- **Điều kiện sau:** User xem được số liệu thống kê theo khoảng thời gian mong muốn

---

### UC-021: Tìm kiếm Toàn cục

- **Actor:** User
- **Luồng chính:**
  1. User nhập từ khóa vào thanh tìm kiếm
  2. System trả về kết quả phân nhóm:
     - Tasks (tên, mô tả)
     - Daily Notes (nội dung)
     - Habits (tên)
     - Goals (tiêu đề)
  3. User nhấn vào kết quả → System điều hướng đến mục tương ứng
- **Điều kiện sau:** User được điều hướng đến nội dung muốn tìm

---

### UC-022: Quản lý Tags

- **Actor:** User
- **Luồng chính:**
  1. User truy cập Settings → Tags hoặc gán tag trực tiếp trong form Task
  2. Tạo tag mới: nhập tên và màu → Lưu
  3. Sửa tag: chọn tag → Edit → Lưu
  4. Xóa tag: chọn tag → Xóa → Xác nhận (tag bị gỡ khỏi tất cả tasks liên quan)
- **Lọc theo tag:**
  - Todo Management → bộ lọc tag → danh sách hiển thị task theo tag đã chọn
- **Điều kiện sau:** Tags được tạo/cập nhật/xóa; tasks có thể lọc theo tag

---

### UC-023: Tạo Nhiệm vụ Lặp lại

- **Actor:** User, System
- **Luồng chính:**
  1. User tạo task mới → bật tùy chọn "Lặp lại"
  2. Chọn tần suất: Hàng ngày / Hàng tuần / Hàng tháng
  3. Lưu
- **Hành vi tự động (System):**
  - Mỗi chu kỳ, System tự động tạo instance mới của task
  - Hoàn thành một instance không ảnh hưởng đến chu kỳ tiếp theo
- **Chỉnh sửa chuỗi lặp:**
  - User có thể dừng lặp lại, thay đổi tần suất hoặc xóa chuỗi
- **Điều kiện sau:** Task lặp lại được tạo tự động theo lịch cài đặt

---

### UC-024: Sao lưu Dữ liệu

- **Actor:** User
- **Điều kiện trước:** User mở Settings → Backup & Restore
- **Luồng chính:**
  1. User nhấn "Xuất dữ liệu"
  2. System yêu cầu chọn thư mục lưu
  3. User chọn thư mục → xác nhận
  4. System xuất file backup (.sql hoặc .json) với timestamp
  5. Thông báo "Sao lưu thành công"
- **Điều kiện sau:** File backup được tạo tại thư mục đã chọn

---

### UC-025: Khôi phục Dữ liệu

- **Actor:** User
- **Điều kiện trước:** File backup hợp lệ tồn tại
- **Luồng chính:**
  1. User nhấn "Nhập dữ liệu"
  2. User chọn file backup
  3. System hiển thị cảnh báo: dữ liệu hiện tại sẽ bị ghi đè
  4. User xác nhận
  5. System khôi phục dữ liệu → reload ứng dụng
- **Luồng thay thế:** File không hợp lệ → System hiển thị lỗi, không thực hiện khôi phục
- **Điều kiện sau:** Dữ liệu được khôi phục từ file backup

---

### UC-026: Thay đổi Cài đặt

- **Actor:** User
- **Luồng chính:**
  1. User mở Settings
  2. Thực hiện các thay đổi:
     - Chuyển Dark / Light theme
     - Cài đặt Pomodoro (focus, break, số vòng)
     - Cài đặt Habit (grace period)
     - Ngôn ngữ giao diện
  3. System áp dụng thay đổi ngay lập tức (không cần reload)
- **Điều kiện sau:** Cài đặt được lưu và áp dụng toàn ứng dụng

---

### UC-027: Quản lý Countdown

- **Actor:** User
- **Luồng chính (Thêm):**
  1. User mở Countdown Board → nhấn "Thêm"
  2. Nhập: tiêu đề, ngày mục tiêu, icon/màu
  3. Lưu → Card hiển thị số ngày còn lại
- **Hiển thị:**
  - Số ngày còn lại (dương: chưa đến, 0: hôm nay, âm: đã qua)
  - Dashboard hiển thị các sự kiện gần nhất
  - Sắp xếp theo ngày đến gần nhất
- **Luồng chỉnh sửa:** Chọn card → Edit → Lưu
- **Luồng xóa:** Chọn card → Xóa → Xác nhận
- **Điều kiện sau:** Countdown card được tạo/cập nhật/xóa; Dashboard phản ánh thay đổi

---

### UC-028: Xem Dashboard

- **Actor:** User
- **Điều kiện trước:** App đã khởi động thành công
- **Luồng chính:**
  1. System hiển thị Dashboard với:
     - Tổng quan nhiệm vụ hôm nay (số task, số đã hoàn thành)
     - Tiến độ tuần (completion rate)
     - Countdown sự kiện gần nhất
     - Quick-launch Stopwatch / Pomodoro
     - Tóm tắt lịch tháng
     - Mục tiêu đang tiến hành
  2. User nhấn vào bất kỳ widget → điều hướng đến trang tương ứng
- **Điều kiện sau:** User nắm được tổng quan ngày hôm nay và có thể điều hướng nhanh
