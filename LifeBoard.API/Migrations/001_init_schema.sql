-- LifeBoard Database Schema v1.0
-- Run order: tables with no FK first, then dependent tables

CREATE DATABASE IF NOT EXISTS lifeboard
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE lifeboard;

-- 1. tasks (self-referencing FK added after)
CREATE TABLE IF NOT EXISTS tasks (
    id                  INT             NOT NULL AUTO_INCREMENT,
    title               VARCHAR(255)    NOT NULL,
    description         TEXT            NULL,
    priority            ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
    status              ENUM('pending','in_progress','done','archived') NOT NULL DEFAULT 'pending',
    deadline            DATETIME        NULL,
    is_recurring        TINYINT(1)      NOT NULL DEFAULT 0,
    recurrence_type     ENUM('daily','weekly','monthly') NULL,
    recurrence_end_date DATE            NULL,
    parent_task_id      INT             NULL,
    planned_date        DATE            NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at        DATETIME        NULL,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_tasks_status       (status),
    INDEX idx_tasks_planned_date (planned_date),
    INDEX idx_tasks_deadline     (deadline),
    INDEX idx_tasks_parent       (parent_task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. tags
CREATE TABLE IF NOT EXISTS tags (
    id    INT         NOT NULL AUTO_INCREMENT,
    name  VARCHAR(50) NOT NULL,
    color VARCHAR(7)  NOT NULL DEFAULT '#6B7280',
    PRIMARY KEY (id),
    UNIQUE KEY uq_tags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. task_tags (junction)
CREATE TABLE IF NOT EXISTS task_tags (
    task_id INT NOT NULL,
    tag_id  INT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    CONSTRAINT fk_tt_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_tt_tag  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. habits
CREATE TABLE IF NOT EXISTS habits (
    id          INT             NOT NULL AUTO_INCREMENT,
    name        VARCHAR(255)    NOT NULL,
    description TEXT            NULL,
    frequency   ENUM('daily','weekly','monthly') NOT NULL DEFAULT 'daily',
    icon        VARCHAR(50)     NULL,
    color       VARCHAR(7)      NOT NULL DEFAULT '#6B7280',
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_habits_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. habit_checkins
CREATE TABLE IF NOT EXISTS habit_checkins (
    id           INT        NOT NULL AUTO_INCREMENT,
    habit_id     INT        NOT NULL,
    checkin_date DATE       NOT NULL,
    is_completed TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_habit_date (habit_id, checkin_date),
    CONSTRAINT fk_hc_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    INDEX idx_hc_date (checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. focus_sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
    id               INT          NOT NULL AUTO_INCREMENT,
    session_type     ENUM('stopwatch','pomodoro') NOT NULL,
    label            VARCHAR(255) NULL,
    start_time       DATETIME     NOT NULL,
    end_time         DATETIME     NOT NULL,
    duration_seconds INT          NOT NULL,
    session_date     DATE         NOT NULL,
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_fs_session_date (session_date),
    INDEX idx_fs_type         (session_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. goals
CREATE TABLE IF NOT EXISTS goals (
    id            INT             NOT NULL AUTO_INCREMENT,
    title         VARCHAR(255)    NOT NULL,
    description   TEXT            NULL,
    current_value DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    target_value  DECIMAL(10,2)   NOT NULL,
    unit          VARCHAR(50)     NOT NULL,
    deadline      DATE            NULL,
    status        ENUM('active','completed','paused') NOT NULL DEFAULT 'active',
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_goals_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. daily_notes
CREATE TABLE IF NOT EXISTS daily_notes (
    id         INT      NOT NULL AUTO_INCREMENT,
    note_date  DATE     NOT NULL,
    content    LONGTEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_daily_notes_date (note_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. mood_entries
CREATE TABLE IF NOT EXISTS mood_entries (
    id         INT          NOT NULL AUTO_INCREMENT,
    entry_date DATE         NOT NULL,
    score      TINYINT      NOT NULL,
    note       VARCHAR(500) NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_mood_date (entry_date),
    CONSTRAINT chk_mood_score CHECK (score BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. countdowns
CREATE TABLE IF NOT EXISTS countdowns (
    id          INT          NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    target_date DATE         NOT NULL,
    icon        VARCHAR(50)  NULL,
    color       VARCHAR(7)   NULL DEFAULT '#6B7280',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_countdowns_date (target_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. settings (singleton)
CREATE TABLE IF NOT EXISTS settings (
    id                      INT         NOT NULL AUTO_INCREMENT,
    theme                   ENUM('light','dark') NOT NULL DEFAULT 'dark',
    pomodoro_focus_minutes  INT         NOT NULL DEFAULT 25,
    pomodoro_break_minutes  INT         NOT NULL DEFAULT 5,
    pomodoro_rounds         INT         NOT NULL DEFAULT 4,
    habit_grace_period_days INT         NOT NULL DEFAULT 0,
    language                VARCHAR(10) NOT NULL DEFAULT 'vi',
    updated_at              DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default settings row
INSERT IGNORE INTO settings (id, theme, pomodoro_focus_minutes, pomodoro_break_minutes, pomodoro_rounds, habit_grace_period_days, language)
VALUES (1, 'dark', 25, 5, 4, 0, 'vi');
