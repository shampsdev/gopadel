-- GoPadel Database Schema Rollback

-- Drop indexes first
DROP INDEX IF EXISTS idx_tournaments_organizator_id;
DROP INDEX IF EXISTS idx_tournaments_club_id;
DROP INDEX IF EXISTS idx_waitlists_tournament_id;
DROP INDEX IF EXISTS idx_waitlists_user_id;
DROP INDEX IF EXISTS idx_payments_registration_id;
DROP INDEX IF EXISTS idx_registrations_tournament_id;
DROP INDEX IF EXISTS idx_registrations_user_id;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_telegram_id;

-- Drop foreign key constraints
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_registration_id;
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS fk_tournaments_organizator_id_users;
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS fk_tournaments_club_id;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS waitlists;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS clubs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS loyalties;

-- Drop custom enum types
DROP TYPE IF EXISTS playingposition;
DROP TYPE IF EXISTS registrationstatus;

-- Note: We don't drop the uuid-ossp extension as it might be used by other applications 