-- Переименование таблицы clubs в courts
-- Этап 1: Переименовать таблицу
ALTER TABLE clubs RENAME TO courts;

-- Этап 2: Переименовать колонку в tournaments
ALTER TABLE tournaments RENAME COLUMN club_id TO court_id;

-- Этап 3: Переименовать constraint
ALTER TABLE tournaments DROP CONSTRAINT fk_tournaments_club_id;
ALTER TABLE tournaments ADD CONSTRAINT fk_tournaments_court_id FOREIGN KEY (court_id) REFERENCES courts(id);

-- Этап 4: Переименовать индекс
DROP INDEX IF EXISTS idx_tournaments_club_id;
CREATE INDEX idx_tournaments_court_id ON tournaments(court_id); 