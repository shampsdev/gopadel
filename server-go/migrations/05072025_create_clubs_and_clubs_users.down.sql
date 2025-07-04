-- Drop indexes
DROP INDEX IF EXISTS idx_clubs_users_user_id;
DROP INDEX IF EXISTS idx_clubs_users_club_id;

-- Drop tables (in reverse order due to foreign key constraints)
DROP TABLE IF EXISTS clubs_users;
DROP TABLE IF EXISTS clubs; 