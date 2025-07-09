-- Объединенная миграция: добавление NOT NULL к endtime и переименование clubs в courts

-- Этап 1: Добавление NOT NULL к end_time
-- Для существующих турниров, где end_time IS NULL, выставить start_time + interval '1 hour'
UPDATE tournaments SET end_time = start_time + interval '1 hour' WHERE end_time IS NULL;

-- Сделать поле end_time NOT NULL
ALTER TABLE tournaments ALTER COLUMN end_time SET NOT NULL;

-- Этап 2: Переименование таблицы clubs в courts
-- Переименовать таблицу
ALTER TABLE clubs RENAME TO courts;

-- Переименовать колонку в tournaments
ALTER TABLE tournaments RENAME COLUMN club_id TO court_id;

-- Переименовать constraint
ALTER TABLE tournaments DROP CONSTRAINT fk_tournaments_club_id;
ALTER TABLE tournaments ADD CONSTRAINT fk_tournaments_court_id FOREIGN KEY (court_id) REFERENCES courts(id);

-- Переименовать индекс
DROP INDEX IF EXISTS idx_tournaments_club_id;
CREATE INDEX idx_tournaments_court_id ON tournaments(court_id); 