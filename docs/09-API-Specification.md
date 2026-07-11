# 09 - API Specification

**Base URL:** `http://localhost:5000/api/v1`
**Format:** JSON (`Content-Type: application/json`)
**Auth:** Không yêu cầu (local-first, single-user)

---

## Quy ước Chung

### Request Headers

```
Content-Type: application/json
Accept: application/json
```

### Response Format

**Thành công (collection):**
```json
{
  "data": [...],
  "total": 42
}
```

**Thành công (single):**
```json
{ "id": 1, "title": "..." }
```

**Lỗi:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Title is required",
  "details": ["title: must not be empty"]
}
```

### HTTP Status Codes

| Code | Ý nghĩa |
|------|---------|
| 200 | OK — Lấy/cập nhật thành công |
| 201 | Created — Tạo mới thành công |
| 204 | No Content — Xóa thành công |
| 400 | Bad Request — Validation thất bại |
| 404 | Not Found — Resource không tồn tại |
| 500 | Internal Server Error |

---

## 1. Tasks

### GET `/tasks`

Lấy danh sách tasks, hỗ trợ filter.

**Query Parameters:**

| Param | Kiểu | Mô tả |
|-------|------|-------|
| `status` | string | `pending` / `in_progress` / `done` / `archived` |
| `priority` | string | `low` / `medium` / `high` |
| `tagId` | int | Lọc theo tag |
| `plannedDate` | date | `YYYY-MM-DD` |
| `search` | string | Tìm trong title, description |
| `page` | int | Trang (mặc định 1) |
| `pageSize` | int | Số item/trang (mặc định 50) |

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Học React",
      "description": "Hoàn thành chapter 5",
      "priority": "high",
      "status": "pending",
      "deadline": "2026-07-15T23:59:00",
      "isRecurring": false,
      "recurrenceType": null,
      "plannedDate": "2026-07-10",
      "tags": [{ "id": 2, "name": "Học tập", "color": "#4A90E2" }],
      "createdAt": "2026-07-10T08:00:00",
      "completedAt": null,
      "updatedAt": "2026-07-10T08:00:00"
    }
  ],
  "total": 15
}
```

---

### GET `/tasks/{id}`

**Response 200:** Task object (xem trên)
**Response 404:** Task không tồn tại

---

### POST `/tasks`

Tạo task mới.

**Request Body:**
```json
{
  "title": "Học React",
  "description": "Hoàn thành chapter 5",
  "priority": "high",
  "deadline": "2026-07-15T23:59:00",
  "plannedDate": "2026-07-10",
  "isRecurring": false,
  "recurrenceType": null,
  "recurrenceEndDate": null,
  "tagIds": [2, 3]
}
```

**Validation:**
- `title`: bắt buộc, tối đa 255 ký tự
- `priority`: một trong `low`, `medium`, `high`
- `isRecurring = true` yêu cầu `recurrenceType` không null

**Response 201:** Task object vừa tạo

---

### PUT `/tasks/{id}`

Cập nhật toàn bộ task.

**Request Body:** Tương tự POST (tất cả trường)
**Response 200:** Task object đã cập nhật

---

### PATCH `/tasks/{id}/complete`

Đánh dấu task hoàn thành.

**Response 200:**
```json
{
  "id": 1,
  "status": "done",
  "completedAt": "2026-07-10T14:30:00"
}
```

---

### PATCH `/tasks/{id}/uncomplete`

Hoàn tác hoàn thành (chuyển về pending).

**Response 200:** Task object với `status: "pending"`, `completedAt: null`

---

### PATCH `/tasks/{id}/archive`

Lưu trữ task.

**Response 200:** Task object với `status: "archived"`

---

### DELETE `/tasks/{id}`

Xóa vĩnh viễn.

**Response 204:** No Content

---

## 2. Tags

### GET `/tags`

**Response 200:**
```json
[
  { "id": 1, "name": "Công việc", "color": "#E74C3C" },
  { "id": 2, "name": "Học tập", "color": "#4A90E2" }
]
```

---

### POST `/tags`

**Request Body:**
```json
{ "name": "Sức khỏe", "color": "#27AE60" }
```

**Validation:** `name` duy nhất, tối đa 50 ký tự; `color` format HEX 7 ký tự
**Response 201:** Tag object

---

### PUT `/tags/{id}`

**Request Body:** `{ "name": "...", "color": "..." }`
**Response 200:** Tag object đã cập nhật

---

### DELETE `/tags/{id}`

Xóa tag và tự động gỡ khỏi tất cả tasks.
**Response 204:** No Content

---

## 3. Habits

### GET `/habits`

**Query Parameters:** `isActive` (boolean, mặc định true)

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Đọc sách 30 phút",
    "description": null,
    "frequency": "daily",
    "icon": "📚",
    "color": "#F39C12",
    "isActive": true,
    "streak": 7,
    "checkedInToday": true,
    "createdAt": "2026-06-01T00:00:00"
  }
]
```

**Ghi chú:** `streak` và `checkedInToday` được tính động phía server.

---

### POST `/habits`

**Request Body:**
```json
{
  "name": "Đọc sách 30 phút",
  "description": null,
  "frequency": "daily",
  "icon": "📚",
  "color": "#F39C12"
}
```

**Validation:** `name` bắt buộc; `frequency` trong `daily`, `weekly`, `monthly`
**Response 201:** Habit object

---

### PUT `/habits/{id}`

**Response 200:** Habit object đã cập nhật

---

### PATCH `/habits/{id}/deactivate`

**Response 200:** `{ "id": 1, "isActive": false }`

---

### DELETE `/habits/{id}`

Xóa habit và toàn bộ check-in history.
**Response 204:** No Content

---

## 4. Habit Check-ins

### GET `/habits/{id}/checkins`

**Query Parameters:** `from` (date), `to` (date)

**Response 200:**
```json
[
  { "id": 10, "habitId": 1, "checkinDate": "2026-07-10", "isCompleted": true },
  { "id": 9,  "habitId": 1, "checkinDate": "2026-07-09", "isCompleted": true }
]
```

---

### POST `/habits/{id}/checkins`

Check-in hoặc uncheckin cho ngày hôm nay (upsert).

**Request Body:**
```json
{ "date": "2026-07-10", "isCompleted": true }
```

**Response 200:** CheckIn object

---

## 5. Focus Sessions

### GET `/focus-sessions`

**Query Parameters:** `from` (date), `to` (date), `type` (stopwatch/pomodoro)

**Response 200:**
```json
{
  "data": [
    {
      "id": 5,
      "sessionType": "stopwatch",
      "label": "Làm báo cáo",
      "startTime": "2026-07-10T09:00:00",
      "endTime": "2026-07-10T10:30:00",
      "durationSeconds": 5400,
      "sessionDate": "2026-07-10",
      "createdAt": "2026-07-10T10:30:00"
    }
  ],
  "totalDurationSeconds": 12600
}
```

---

### POST `/focus-sessions`

**Request Body:**
```json
{
  "sessionType": "stopwatch",
  "label": "Làm báo cáo",
  "startTime": "2026-07-10T09:00:00",
  "endTime": "2026-07-10T10:30:00"
}
```

**Validation:** `startTime < endTime`; `sessionType` bắt buộc
**Response 201:** FocusSession object (server tự tính `durationSeconds`, `sessionDate`)

---

### DELETE `/focus-sessions/{id}`

**Response 204:** No Content

---

## 6. Goals

### GET `/goals`

**Query Parameters:** `status` (active/completed/paused)

**Response 200:**
```json
[
  {
    "id": 1,
    "title": "Chạy bộ 100km",
    "description": null,
    "currentValue": 42.5,
    "targetValue": 100.0,
    "unit": "km",
    "progressPercent": 42.5,
    "deadline": "2026-12-31",
    "status": "active",
    "createdAt": "2026-01-01T00:00:00",
    "updatedAt": "2026-07-10T00:00:00"
  }
]
```

---

### POST `/goals`

**Request Body:**
```json
{
  "title": "Chạy bộ 100km",
  "description": null,
  "currentValue": 0,
  "targetValue": 100,
  "unit": "km",
  "deadline": "2026-12-31"
}
```

**Validation:** `title`, `targetValue`, `unit` bắt buộc; `targetValue > 0`
**Response 201:** Goal object

---

### PUT `/goals/{id}`

**Response 200:** Goal object đã cập nhật

---

### PATCH `/goals/{id}/progress`

Cập nhật nhanh tiến độ.

**Request Body:** `{ "currentValue": 55.0 }`

**Xử lý:** Nếu `currentValue >= targetValue` → `status = completed`
**Response 200:** Goal object

---

### DELETE `/goals/{id}`

**Response 204:** No Content

---

## 7. Daily Notes

### GET `/daily-notes/{date}`

**Param:** `date` = `YYYY-MM-DD`

**Response 200:**
```json
{
  "id": 3,
  "noteDate": "2026-07-10",
  "content": "# Hôm nay\n- Hoàn thành task A\n- ...",
  "updatedAt": "2026-07-10T22:00:00"
}
```

**Response 404:** Chưa có ghi chú cho ngày này

---

### PUT `/daily-notes/{date}`

Tạo mới hoặc cập nhật ghi chú cho ngày (upsert).

**Request Body:**
```json
{ "content": "# Hôm nay\n- Hoàn thành task A" }
```

**Response 200:** DailyNote object

---

## 8. Mood Entries

### GET `/mood-entries/{date}`

**Response 200:**
```json
{ "id": 1, "entryDate": "2026-07-10", "score": 4, "note": "Khá tốt hôm nay", "createdAt": "..." }
```

---

### GET `/mood-entries`

**Query Parameters:** `from`, `to`

**Response 200:** Array của MoodEntry objects

---

### PUT `/mood-entries/{date}`

Upsert tâm trạng cho ngày.

**Request Body:**
```json
{ "score": 4, "note": "Khá tốt hôm nay" }
```

**Validation:** `score` trong khoảng 1–5
**Response 200:** MoodEntry object

---

## 9. Countdowns

### GET `/countdowns`

**Response 200:**
```json
[
  {
    "id": 1,
    "title": "Bảo vệ đồ án",
    "targetDate": "2026-09-15",
    "daysRemaining": 67,
    "icon": "🎓",
    "color": "#8E44AD"
  }
]
```

**Ghi chú:** `daysRemaining` tính động — dương (còn lại), 0 (hôm nay), âm (đã qua).

---

### POST `/countdowns`

**Request Body:**
```json
{
  "title": "Bảo vệ đồ án",
  "targetDate": "2026-09-15",
  "icon": "🎓",
  "color": "#8E44AD"
}
```

**Response 201:** Countdown object

---

### PUT `/countdowns/{id}`

**Response 200:** Countdown object đã cập nhật

---

### DELETE `/countdowns/{id}`

**Response 204:** No Content

---

## 10. Settings

### GET `/settings`

**Response 200:**
```json
{
  "theme": "dark",
  "pomodoroFocusMinutes": 25,
  "pomodoroBreakMinutes": 5,
  "pomodoroRounds": 4,
  "habitGracePeriodDays": 0,
  "language": "vi"
}
```

---

### PUT `/settings`

Cập nhật toàn bộ settings (upsert).

**Request Body:**
```json
{
  "theme": "light",
  "pomodoroFocusMinutes": 45,
  "pomodoroBreakMinutes": 10,
  "pomodoroRounds": 3,
  "habitGracePeriodDays": 1,
  "language": "vi"
}
```

**Response 200:** Settings object

---

## 11. Analytics

### GET `/analytics/weekly`

**Query Parameters:** `weekStart` (date, `YYYY-MM-DD`, mặc định đầu tuần hiện tại)

**Response 200:**
```json
{
  "weekStart": "2026-07-07",
  "weekEnd": "2026-07-13",
  "days": [
    {
      "date": "2026-07-07",
      "completedTasks": 5,
      "focusMinutes": 120,
      "habitsCompleted": 3,
      "habitsTotal": 4,
      "moodScore": 4
    }
  ],
  "summary": {
    "totalCompletedTasks": 28,
    "totalFocusMinutes": 630,
    "completionRate": 0.82,
    "avgMoodScore": 3.7
  }
}
```

---

### GET `/analytics/monthly`

**Query Parameters:** `year` (int), `month` (int 1–12)

**Response 200:**
```json
{
  "year": 2026,
  "month": 7,
  "days": [
    { "date": "2026-07-01", "completedTasks": 3, "focusMinutes": 90, "habitsCompleted": 2 }
  ],
  "summary": {
    "totalCompletedTasks": 62,
    "totalFocusHours": 48.5,
    "completionRate": 0.78
  }
}
```

---

### GET `/analytics/yearly`

**Query Parameters:** `year` (int, mặc định năm hiện tại)

**Response 200:**
```json
{
  "year": 2026,
  "heatmap": [
    {
      "date": "2026-01-01",
      "taskCount": 4,
      "focusMinutes": 90,
      "habitDone": 3,
      "intensityLevel": 2
    }
  ]
}
```

**Ghi chú:** `intensityLevel` từ 0–4 (0 = không hoạt động, 4 = rất năng động) để render màu heatmap.

---

### GET `/analytics/statistics`

**Query Parameters:** `from` (date), `to` (date)

**Response 200:**
```json
{
  "period": { "from": "2026-06-10", "to": "2026-07-10" },
  "tasks": {
    "total": 120,
    "completed": 98,
    "completionRate": 0.817,
    "byPriority": { "high": 30, "medium": 50, "low": 40 }
  },
  "focus": {
    "totalSessions": 45,
    "totalMinutes": 1890,
    "avgMinutesPerDay": 63,
    "byType": { "stopwatch": 20, "pomodoro": 25 }
  },
  "habits": {
    "longestStreak": { "habitName": "Đọc sách", "streak": 21 },
    "avgCompletionRate": 0.74
  },
  "mood": {
    "avgScore": 3.8,
    "distribution": { "1": 2, "2": 5, "3": 10, "4": 15, "5": 8 }
  }
}
```

---

## 12. Daily Detail

### GET `/daily-detail/{date}`

Lấy toàn bộ thông tin của một ngày.

**Param:** `date` = `YYYY-MM-DD`

**Response 200:**
```json
{
  "date": "2026-07-10",
  "tasks": {
    "total": 8,
    "completed": 5,
    "items": [...]
  },
  "focusSessions": {
    "totalMinutes": 180,
    "items": [...]
  },
  "habitCheckIns": [
    { "habitId": 1, "habitName": "Đọc sách", "isCompleted": true, "streak": 7 }
  ],
  "dailyNote": {
    "content": "# Ngày 10/7..."
  },
  "moodEntry": {
    "score": 4,
    "note": "Khá tốt"
  }
}
```

---

## 13. Search

### GET `/search`

**Query Parameters:** `q` (string, bắt buộc, tối thiểu 2 ký tự)

**Response 200:**
```json
{
  "query": "react",
  "results": {
    "tasks": [
      { "id": 1, "title": "Học React", "status": "pending" }
    ],
    "notes": [
      { "noteDate": "2026-07-08", "preview": "...học React hooks..." }
    ],
    "habits": [],
    "goals": []
  },
  "totalCount": 3
}
```

---

## 14. Backup & Restore

### GET `/backup/export`

Xuất toàn bộ dữ liệu.

**Response 200:**
- `Content-Type: application/json`
- `Content-Disposition: attachment; filename="lifeboard_backup_20260710_232000.json"`
- Body: JSON file với cấu trúc:
```json
{
  "version": "1.0",
  "exportedAt": "2026-07-10T23:20:00",
  "data": {
    "tasks": [...],
    "tags": [...],
    "task_tags": [...],
    "habits": [...],
    "habit_checkins": [...],
    "focus_sessions": [...],
    "goals": [...],
    "daily_notes": [...],
    "mood_entries": [...],
    "countdowns": [...],
    "settings": {...}
  }
}
```

---

### POST `/backup/import`

Khôi phục dữ liệu từ file backup.

**Request:** `multipart/form-data`, field `file` chứa file JSON backup

**Validation:** Kiểm tra `version` và cấu trúc `data`

**Response 200:**
```json
{ "message": "Restore completed successfully", "importedAt": "2026-07-10T23:25:00" }
```

**Response 400:** File không hợp lệ
