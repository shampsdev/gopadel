-- Rename username to telegram_username and second_name to last_name
-- This migration preserves all existing data

-- Rename username column to telegram_username
ALTER TABLE users RENAME COLUMN username TO telegram_username;

-- Rename second_name column to last_name  
ALTER TABLE users RENAME COLUMN second_name TO last_name;

-- Update the index name to match the new column name
DROP INDEX IF EXISTS idx_users_username;
CREATE INDEX idx_users_telegram_username ON users(telegram_username);
