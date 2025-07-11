-- Добавляем поле is_finished в таблицу tournaments
ALTER TABLE tournaments ADD COLUMN is_finished BOOLEAN NOT NULL DEFAULT FALSE;

-- Создаем индекс для поля is_finished для быстрого поиска
CREATE INDEX idx_tournaments_is_finished ON tournaments(is_finished); 