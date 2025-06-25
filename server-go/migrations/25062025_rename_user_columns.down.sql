-- Rollback: Rename telegram_username back to username and last_name back to second_name
-- This migration preserves all existing data

-- Rename telegram_username column back to username
ALTER TABLE users RENAME COLUMN telegram_username TO username;

-- Rename last_name column back to second_name
ALTER TABLE users RENAME COLUMN last_name TO second_name;

-- Update the index name back to the original name
DROP INDEX IF EXISTS idx_users_telegram_username;
CREATE INDEX idx_users_username ON users(username);
