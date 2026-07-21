-- LifeBoard v2 Database Schema
-- All date-only columns use DATE type (no datetime timezone issues)

CREATE DATABASE IF NOT EXISTS lifeboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lifeboard;

-- 1. tasks
CREATE TABLE IF NOT EXISTS tasks (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    note        TEXT NULL,
    priority    ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
    status      ENUM('pending','done') NOT NULL DEFAULT 'pending',
    planned_date DATE NOT NULL,
    completed_at DATETIME NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tasks_planned_date (planned_date),
    INDEX idx_tasks_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. habits
CREATE TABLE IF NOT EXISTS habits (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT NULL,
    icon        VARCHAR(50) NULL,
    color       VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_habits_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. habit_logs
CREATE TABLE IF NOT EXISTS habit_logs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    habit_id    INT NOT NULL,
    log_date    DATE NOT NULL,
    done        TINYINT(1) NOT NULL DEFAULT 0,
    UNIQUE KEY uq_habit_date (habit_id, log_date),
    CONSTRAINT fk_hl_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    INDEX idx_hl_date (log_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. goals
CREATE TABLE IF NOT EXISTS goals (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT NULL,
    current_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    target_value  DECIMAL(10,2) NOT NULL,
    unit          VARCHAR(50) NOT NULL,
    deadline      DATE NULL,
    status        ENUM('active','completed','paused') NOT NULL DEFAULT 'active',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_goals_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. countdowns
CREATE TABLE IF NOT EXISTS countdowns (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    target_date DATE NOT NULL,
    icon        VARCHAR(50) NULL,
    color       VARCHAR(7) NULL DEFAULT '#3D8EF0',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_countdowns_date (target_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. focus_sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    label            VARCHAR(255) NULL,
    session_date     DATE NOT NULL,
    start_time       DATETIME NOT NULL,
    end_time         DATETIME NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    splits           TEXT NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fs_date (session_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. daily_notes
CREATE TABLE IF NOT EXISTS daily_notes (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    note_date  DATE NOT NULL,
    content    LONGTEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_note_date (note_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. mood_entries
CREATE TABLE IF NOT EXISTS mood_entries (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    entry_date DATE NOT NULL,
    score      TINYINT NOT NULL,
    note       VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_mood_date (entry_date),
    CONSTRAINT chk_mood CHECK (score BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
