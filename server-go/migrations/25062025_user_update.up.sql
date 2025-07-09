-- This migration preserves all existing data

-- Rename username column to telegram_username
ALTER TABLE users RENAME COLUMN username TO telegram_username;

-- Rename second_name column to last_name  
ALTER TABLE users RENAME COLUMN second_name TO last_name;

-- Update the index name to match the new column name
DROP INDEX IF EXISTS idx_users_username;
CREATE INDEX idx_users_telegram_username ON users(telegram_username);


ALTER TABLE users ALTER COLUMN loyalty_id SET DEFAULT 1;
ALTER TABLE users ALTER COLUMN rank SET DEFAULT 1.0;
ALTER TABLE users ALTER COLUMN is_registered SET DEFAULT false;

UPDATE users SET rank = 1.0 WHERE rank < 0 OR rank > 7;
ALTER TABLE users ADD CONSTRAINT ck_users_rank CHECK (rank >= 0 AND rank <= 7);