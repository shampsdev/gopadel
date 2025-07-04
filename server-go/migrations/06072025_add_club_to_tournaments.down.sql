-- Убираем индекс
DROP INDEX IF EXISTS idx_tournaments_club_community_id;

-- Убираем внешний ключ
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS fk_tournaments_club_community_id;

-- Убираем колонку
ALTER TABLE tournaments DROP COLUMN IF EXISTS club_id; 