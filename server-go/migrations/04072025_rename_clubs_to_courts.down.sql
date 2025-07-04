-- Откат переименования courts обратно в clubs
-- Этап 1: Переименовать индекс обратно
DROP INDEX IF EXISTS idx_tournaments_court_id;
CREATE INDEX idx_tournaments_club_id ON tournaments(court_id);

-- Этап 2: Переименовать constraint обратно
ALTER TABLE tournaments DROP CONSTRAINT fk_tournaments_court_id;
ALTER TABLE tournaments ADD CONSTRAINT fk_tournaments_club_id FOREIGN KEY (court_id) REFERENCES courts(id);

-- Этап 3: Переименовать колонку обратно
ALTER TABLE tournaments RENAME COLUMN court_id TO club_id;

-- Этап 4: Переименовать таблицу обратно
ALTER TABLE courts RENAME TO clubs; 