# 10 - UI Guideline

**Dự án:** LifeBoard — Personal Productivity System
**Phiên bản:** 1.0

---

## 1. Design Philosophy

LifeBoard hướng tới giao diện **premium dark-first**, lấy cảm hứng từ các công cụ năng suất hiện đại (Linear, Notion, Raycast). Nguyên tắc cốt lõi:

- **Clarity:** Thông tin quan trọng nhất luôn nổi bật trước
- **Calm productivity:** Màu sắc chọn lọc, không gây mỏi mắt khi làm việc dài giờ
- **Micro-delight:** Animation nhỏ làm giao diện sống động mà không gây phân tán
- **Consistency:** Mọi component, spacing, màu sắc tuân thủ design token

---

## 2. Color System

### 2.1 Dark Theme (mặc định)

```css
:root[data-theme="dark"] {
  /* Background */
  --bg-base:        #0F1117;   /* Nền toàn trang */
  --bg-surface:     #1A1D27;   /* Card, Sidebar */
  --bg-elevated:    #22263A;   /* Modal, Dropdown */
  --bg-overlay:     #2C3150;   /* Hover state, Input */

  /* Border */
  --border-subtle:  #2A2D3E;   /* Đường kẻ nhẹ */
  --border-default: #363A52;   /* Border mặc định */
  --border-strong:  #4A4F6A;   /* Border focus */

  /* Text */
  --text-primary:   #E8EAF6;   /* Tiêu đề chính */
  --text-secondary: #9EA3BE;   /* Mô tả, placeholder */
  --text-muted:     #5C6280;   /* Nhãn tắt, disabled */
  --text-inverse:   #0F1117;   /* Text trên nền sáng */

  /* Brand / Accent */
  --accent-primary:  #7C6BFF;  /* Tím đặc trưng — CTA chính */
  --accent-hover:    #6B5AEE;  /* Hover của accent */
  --accent-subtle:   #2D2960;  /* Background nhẹ của accent */
  --accent-glow:     rgba(124,107,255,0.25); /* Glow effect */

  /* Semantic */
  --color-success:   #34D399;  /* Xanh lá — hoàn thành */
  --color-warning:   #FBBF24;  /* Vàng — cảnh báo */
  --color-danger:    #F87171;  /* Đỏ — lỗi, xóa */
  --color-info:      #60A5FA;  /* Xanh dương — thông tin */

  /* Priority Colors */
  --priority-high:   #F87171;
  --priority-medium: #FBBF24;
  --priority-low:    #34D399;

  /* Mood Colors (1–5) */
  --mood-1: #F87171;  /* Rất tệ */
  --mood-2: #FB923C;  /* Tệ */
  --mood-3: #FBBF24;  /* Bình thường */
  --mood-4: #34D399;  /* Tốt */
  --mood-5: #818CF8;  /* Rất tốt */

  /* Heatmap Intensity (0–4) */
  --heatmap-0: #1A1D27;
  --heatmap-1: #2D2960;
  --heatmap-2: #4B3FAA;
  --heatmap-3: #6B5AEE;
  --heatmap-4: #7C6BFF;
}
```

### 2.2 Light Theme

```css
:root[data-theme="light"] {
  --bg-base:        #F8F9FC;
  --bg-surface:     #FFFFFF;
  --bg-elevated:    #F0F2FA;
  --bg-overlay:     #E8EBF5;

  --border-subtle:  #E2E5F0;
  --border-default: #CDD2E8;
  --border-strong:  #A8AFCF;

  --text-primary:   #1A1D2E;
  --text-secondary: #5C6280;
  --text-muted:     #9EA3BE;
  --text-inverse:   #F8F9FC;

  --accent-primary: #6B5AEE;
  --accent-hover:   #5A4ADD;
  --accent-subtle:  #EAE8FF;

  --color-success:  #059669;
  --color-warning:  #D97706;
  --color-danger:   #DC2626;
  --color-info:     #2563EB;

  --heatmap-0: #E8EBF5;
  --heatmap-1: #C7C0FF;
  --heatmap-2: #9F96FF;
  --heatmap-3: #7C6BFF;
  --heatmap-4: #5A4ADD;
}
```

---

## 3. Typography

### 3.1 Font Stack

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

### 3.2 Type Scale

| Token | Size | Weight | Line-height | Dùng cho |
|-------|------|--------|-------------|---------|
| `--text-xs` | 11px | 400 | 1.5 | Label nhỏ, badge |
| `--text-sm` | 13px | 400 | 1.5 | Body nhỏ, helper text |
| `--text-base` | 15px | 400 | 1.6 | Body mặc định |
| `--text-md` | 16px | 500 | 1.5 | Subtitle, card title |
| `--text-lg` | 18px | 600 | 1.4 | Section heading |
| `--text-xl` | 22px | 600 | 1.3 | Page heading |
| `--text-2xl` | 28px | 700 | 1.2 | Dashboard stat number |
| `--text-3xl` | 36px | 700 | 1.1 | Hero / countdown số lớn |

---

## 4. Spacing System

Base unit: **4px**

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

**Quy tắc:**
- Padding trong card: `--space-5` (20px)
- Gap giữa items trong list: `--space-3` (12px)
- Margin giữa sections: `--space-8` (32px)
- Padding nội dung trang: `--space-6` (24px)

---

## 5. Border Radius

```css
:root {
  --radius-sm:   6px;   /* Badge, input nhỏ */
  --radius-md:   10px;  /* Card, button */
  --radius-lg:   14px;  /* Modal, panel lớn */
  --radius-xl:   20px;  /* Countdown card nổi bật */
  --radius-full: 9999px; /* Pill badge, avatar */
}
```

---

## 6. Shadow & Elevation

```css
:root {
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.3);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg:  0 8px 24px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 20px var(--accent-glow);  /* Focus / active */
}
```

---

## 7. Layout

### 7.1 AppShell

```
┌────────────────────────────────────────────────────────────┐
│ HEADER — height: 56px, sticky top                          │
│  padding: 0 24px                                           │
│  [Logo 32px] [Page Title]        [SearchBar] [ThemeToggle] │
├──────────────┬─────────────────────────────────────────────┤
│ SIDEBAR      │ MAIN CONTENT                                │
│ width: 240px │ padding: 24px                               │
│ fixed left   │ max-width: 1200px, centered                 │
│              │                                             │
│ Nav items    │ <Outlet />                                  │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

### 7.2 Sidebar Navigation Items

```
[Icon] Label
```
- Chiều cao mỗi item: 40px
- Padding: 0 16px
- Border-radius: `--radius-md` khi active/hover
- Active state: `background: var(--accent-subtle)`, `color: var(--accent-primary)`
- Icon size: 18px

### 7.3 Grid System

Dashboard dùng CSS Grid:

```css
/* Dashboard widgets */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-5);
}
/* Today tasks: 8 cols, Countdown: 4 cols */
/* Stats row: 3x4 cols */
```

---

## 8. Component Specifications

### 8.1 Button

| Variant | Background | Text | Border | Dùng cho |
|---------|-----------|------|--------|---------|
| `primary` | `--accent-primary` | white | none | CTA chính |
| `secondary` | `--bg-elevated` | `--text-primary` | `--border-default` | Hành động phụ |
| `ghost` | transparent | `--text-secondary` | none | Nút ít quan trọng |
| `danger` | `--color-danger` | white | none | Xóa, cảnh báo |

```css
.btn {
  height: 36px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all 150ms ease;
  cursor: pointer;
}
.btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn[disabled] { opacity: 0.4; cursor: not-allowed; }
```

**Sizes:**
- `sm`: height 28px, padding 0 12px, font-size 12px
- `md` (default): height 36px
- `lg`: height 44px, padding 0 20px, font-size 15px

---

### 8.2 Input / Form Field

```css
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.input-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

.input {
  height: 40px;
  padding: 0 12px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.input-error {
  border-color: var(--color-danger);
}

.error-message {
  font-size: var(--text-xs);
  color: var(--color-danger);
}
```

---

### 8.3 Card

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.card:hover {
  border-color: var(--border-default);
  box-shadow: var(--shadow-md);
}
```

---

### 8.4 Task Card

```
┌─────────────────────────────────────────────┐
│ ☐  Task Title                    [HIGH] 📅 15/7 │
│    Mô tả ngắn (nếu có)                      │
│    🏷 Học tập  🏷 React                      │
│                          [Edit] [Delete]    │
└─────────────────────────────────────────────┘
```

- Checkbox: 18x18px, border-radius 4px
- Khi `status = done`: title gạch ngang (`text-decoration: line-through`), opacity 0.5
- Priority badge: pill shape, màu theo `--priority-*`
- Hover: hiện action buttons (fade-in animation)

---

### 8.5 Badge / Tag

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
}

.badge-priority-high   { background: rgba(248,113,113,0.15); color: #F87171; }
.badge-priority-medium { background: rgba(251,191,36,0.15);  color: #FBBF24; }
.badge-priority-low    { background: rgba(52,211,153,0.15);  color: #34D399; }
```

---

### 8.6 Modal

```css
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
  animation: fadeIn 200ms ease;
}

.modal-content {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  width: 100%; max-width: 520px;
  box-shadow: var(--shadow-lg);
  animation: slideUp 250ms cubic-bezier(0.34,1.56,0.64,1);
}
```

---

### 8.7 Progress Bar

```css
.progress-track {
  height: 8px;
  background: var(--bg-overlay);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--accent-primary), #A78BFA);
  transition: width 600ms cubic-bezier(0.34,1.56,0.64,1);
}
```

---

### 8.8 Pomodoro / Stopwatch Timer Display

```
      ┌─────────────────────┐
      │       25:00         │  ← --text-3xl, mono font
      │  ████████████░░░░░  │  ← circular progress ring
      │   [START] [RESET]   │
      └─────────────────────┘
```

- Circular ring: SVG `stroke-dasharray` animation
- Timer font: `--font-mono`
- Ring color: `--accent-primary` khi focus, `--color-success` khi break

---

## 9. Micro-Animations

### 9.1 Keyframes

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes checkPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
```

### 9.2 Animation Usage

| Element | Animation | Duration | Trigger |
|---------|-----------|----------|---------|
| Page transition | `fadeIn` | 200ms | Route change |
| Modal open | `slideUp` | 250ms | Mở modal |
| Task card | `slideInLeft` | 200ms | Thêm vào list |
| Checkbox hoàn thành | `checkPop` | 300ms | Tick |
| Sidebar items | `slideInLeft` staggered | 150ms | App load |
| Heatmap cells | `scaleIn` staggered | 10ms/cell | Load |
| Timer running | `pulse` | 2s loop | Stopwatch active |
| Streak badge | `scaleIn` | 200ms | Hiện streak |

### 9.3 Transition Defaults

```css
/* Áp dụng cho tất cả interactive elements */
* {
  transition-property: background-color, border-color, color, box-shadow, transform, opacity;
  transition-duration: 150ms;
  transition-timing-function: ease;
}
```

---

## 10. Icon System

Sử dụng **Lucide React** (consistent, sharp, modern).

| Section | Icon |
|---------|------|
| Dashboard | `LayoutDashboard` |
| Calendar | `Calendar` |
| Tasks | `CheckSquare` |
| Tomorrow | `Sunrise` |
| Habits | `Repeat` |
| Goals | `Target` |
| Stopwatch | `Timer` |
| Pomodoro | `Clock` |
| Notes | `FileText` |
| Mood | `Smile` |
| Analytics | `BarChart2` |
| Statistics | `TrendingUp` |
| Search | `Search` |
| Countdown | `AlarmClock` |
| Settings | `Settings` |
| Backup | `Download` |
| Restore | `Upload` |

**Kích thước chuẩn:**
- Sidebar nav: 18px
- Button icon: 16px
- Card icon: 20px
- Empty state: 48px

---

## 11. Heatmap Design

```
Jan  ░░▒▒▓█░░▒▒  ...  Dec
Mon  ░ ▒ ░ ▓ ░ ...
Wed  ▒ ░ ░ █ ▒ ...
Fri  ░ ▓ ▒ ░ ░ ...
```

- Mỗi ô: 12x12px, border-radius 2px, gap 3px
- 5 mức màu: `--heatmap-0` (không hoạt động) → `--heatmap-4` (rất năng động)
- Hover: scale(1.4) + tooltip

---

## 12. Responsive Breakpoints

| Breakpoint | Width | Hành vi |
|-----------|-------|---------|
| Desktop | ≥ 1280px | Sidebar cố định, layout đầy đủ |
| Tablet | 768–1279px | Sidebar collapse thành icon-only (64px) |
| Mobile | < 768px | *Out of scope* — không hỗ trợ chính thức |

---

## 13. Theme Switching

```typescript
// themeStore.ts (Zustand)
const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'dark',
  toggle: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('lifeboard-theme', next);
    return { theme: next };
  }),
}));
```

- Theme được lưu vào `localStorage`
- Áp dụng ngay lập tức qua `data-theme` attribute trên `<html>`
- Không cần reload trang

---

## 14. Empty State Design

Khi một section không có dữ liệu, hiển thị:

```
        [Icon 48px, opacity 0.3]
        Chưa có nhiệm vụ nào
        Nhấn "Thêm" để bắt đầu

        [+ Thêm nhiệm vụ]  ← button primary
```

- Container: flex column, align-center, gap 12px
- Icon: `--text-muted`
- Title: `--text-secondary`, font-size `--text-md`
- Subtitle: `--text-muted`, font-size `--text-sm`

---

## 15. Accessibility

| Yêu cầu | Thực hiện |
|---------|-----------|
| Contrast ratio | Text trên nền ≥ 4.5:1 (WCAG AA) |
| Focus ring | Mọi interactive element có focus visible rõ ràng (`box-shadow: 0 0 0 3px var(--accent-glow)`) |
| Keyboard nav | Tab order hợp lý; Modal trap focus |
| ARIA labels | Icon-only buttons có `aria-label` |
| Reduced motion | `@media (prefers-reduced-motion)` tắt animation |
