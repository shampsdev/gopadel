-- Добавляем поле club_id для связи турниров с клубами-сообществами
ALTER TABLE tournaments ADD COLUMN club_id VARCHAR(255);

-- Добавляем внешний ключ
ALTER TABLE tournaments ADD CONSTRAINT fk_tournaments_club_community_id FOREIGN KEY (club_id) REFERENCES clubs(id);

-- Добавляем индекс для производительности
CREATE INDEX idx_tournaments_club_community_id ON tournaments(club_id);

-- Устанавливаем всем существующим турнирам club_id = 'global' (глобальное сообщество)
UPDATE tournaments SET club_id = 'global' WHERE club_id IS NULL; 