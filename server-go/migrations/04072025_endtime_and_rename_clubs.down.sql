-- Откат объединенной миграции: удаление NOT NULL с endtime и возврат courts в clubs

-- Этап 1: Откат переименования courts обратно в clubs
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

-- Этап 2: Откат NOT NULL с end_time
-- Сделать поле end_time NULLABLE
ALTER TABLE tournaments ALTER COLUMN end_time DROP NOT NULL; 