-- Migration 002: Add timezone column to settings table
-- Run after 001_init_schema.sql
-- Note: MySQL 8.0 does not support ADD COLUMN IF NOT EXISTS.
-- Run this only once (skip if column already exists).

ALTER TABLE settings
    ADD COLUMN timezone VARCHAR(60) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh'
    AFTER language;
