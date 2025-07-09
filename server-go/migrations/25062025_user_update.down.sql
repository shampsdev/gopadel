-- Rollback: Rename telegram_username back to username and last_name back to second_name
-- This migration preserves all existing data
ALTER TABLE users ALTER COLUMN loyalty_id DROP DEFAULT;
ALTER TABLE users ALTER COLUMN rank DROP DEFAULT;
ALTER TABLE users ALTER COLUMN is_registered DROP DEFAULT;

ALTER TABLE users DROP CONSTRAINT ck_users_rank;


-- Rename telegram_username column back to username
ALTER TABLE users RENAME COLUMN telegram_username TO username;

-- Rename last_name column back to second_name
ALTER TABLE users RENAME COLUMN last_name TO second_name;

-- Update the index name back to the original name
DROP INDEX IF EXISTS idx_users_telegram_username;
CREATE INDEX idx_users_username ON users(username);
