-- Откат объединенной миграции улучшений для tournaments
-- Откатывает следующие миграции:
-- - add_is_finished_to_tournaments
-- - 04072025_endtime_and_rename_clubs
-- - 05072025_create_clubs_with_tournaments
-- - 09072025_expand_domain_models

-- Этап 1: Откат добавления data колонки для tournaments
ALTER TABLE tournaments DROP COLUMN IF EXISTS data;

-- Этап 2: Откат добавления полей created_at и updated_at ко всем таблицам
-- Удаление триггеров
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_courts_updated_at ON courts;
DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
DROP TRIGGER IF EXISTS update_clubs_updated_at ON clubs;

-- Удаление функции обновления updated_at
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Удаление столбцов created_at и updated_at из всех таблиц
ALTER TABLE users DROP COLUMN IF EXISTS created_at;
ALTER TABLE users DROP COLUMN IF EXISTS updated_at;

ALTER TABLE courts DROP COLUMN IF EXISTS created_at;
ALTER TABLE courts DROP COLUMN IF EXISTS updated_at;

ALTER TABLE tournaments DROP COLUMN IF EXISTS created_at;
ALTER TABLE tournaments DROP COLUMN IF EXISTS updated_at;

ALTER TABLE registrations DROP COLUMN IF EXISTS created_at;
ALTER TABLE registrations DROP COLUMN IF EXISTS updated_at;

ALTER TABLE payments DROP COLUMN IF EXISTS created_at;
ALTER TABLE payments DROP COLUMN IF EXISTS updated_at;

-- Этап 3: Откат связи tournaments с clubs и удаление таблиц clubs
-- Убираем индекс
DROP INDEX IF EXISTS idx_tournaments_club_community_id;

-- Убираем внешний ключ
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS fk_tournaments_club_community_id;

-- Убираем колонку
ALTER TABLE tournaments DROP COLUMN IF EXISTS club_id;

-- Убираем индексы
DROP INDEX IF EXISTS idx_clubs_users_user_id;
DROP INDEX IF EXISTS idx_clubs_users_club_id;

-- Удаляем таблицы (в обратном порядке из-за внешних ключей)
DROP TABLE IF EXISTS clubs_users;
DROP TABLE IF EXISTS clubs;

-- Этап 4: Откат добавления is_finished к tournaments
-- Удаляем индекс для поля is_finished
DROP INDEX IF EXISTS idx_tournaments_is_finished;

-- Удаляем поле is_finished из таблицы tournaments
ALTER TABLE tournaments DROP COLUMN IF EXISTS is_finished;

-- Этап 5: Откат NOT NULL с end_time
-- Сделать поле end_time NULLABLE
ALTER TABLE tournaments ALTER COLUMN end_time DROP NOT NULL;

-- Этап 6: Откат переименования courts обратно в clubs
-- Переименовать индекс обратно
DROP INDEX IF EXISTS idx_tournaments_court_id;
CREATE INDEX idx_tournaments_club_id ON tournaments(court_id);

-- Переименовать constraint обратно
ALTER TABLE tournaments DROP CONSTRAINT fk_tournaments_court_id;
ALTER TABLE tournaments ADD CONSTRAINT fk_tournaments_club_id FOREIGN KEY (court_id) REFERENCES courts(id);

-- Переименовать колонку обратно
ALTER TABLE tournaments RENAME COLUMN court_id TO club_id;

-- Переименовать таблицу обратно
ALTER TABLE courts RENAME TO clubs; 