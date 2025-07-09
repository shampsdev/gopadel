-- Откат объединенной миграции: удаление связи tournaments с clubs и удаление таблиц clubs

-- Этап 1: Удаление связи tournaments с clubs
-- Убираем индекс
DROP INDEX IF EXISTS idx_tournaments_club_community_id;

-- Убираем внешний ключ
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS fk_tournaments_club_community_id;

-- Убираем колонку
ALTER TABLE tournaments DROP COLUMN IF EXISTS club_id;

-- Этап 2: Удаление таблиц clubs и clubs_users
-- Убираем индексы
DROP INDEX IF EXISTS idx_clubs_users_user_id;
DROP INDEX IF EXISTS idx_clubs_users_club_id;

-- Удаляем таблицы (в обратном порядке из-за внешних ключей)
DROP TABLE IF EXISTS clubs_users;
DROP TABLE IF EXISTS clubs; 