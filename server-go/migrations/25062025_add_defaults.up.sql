ALTER TABLE users ALTER COLUMN loyalty_id SET DEFAULT 1;
ALTER TABLE users ALTER COLUMN rank SET DEFAULT 1.0;
ALTER TABLE users ALTER COLUMN is_registered SET DEFAULT false;

UPDATE users SET rank = 1.0 WHERE rank < 0 OR rank > 7;
ALTER TABLE users ADD CONSTRAINT ck_users_rank CHECK (rank >= 0 AND rank <= 7);