-- Объединенная миграция: создание таблиц clubs, clubs_users и добавление связи с tournaments

-- Этап 1: Создание таблицы clubs (communities)
CREATE TABLE clubs (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Этап 2: Создание таблицы clubs_users (many-to-many relationship)
CREATE TABLE clubs_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id VARCHAR(255) NOT NULL REFERENCES clubs(id),
    user_id UUID NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(club_id, user_id)
);

-- Создание индексов для лучшей производительности
CREATE INDEX idx_clubs_users_club_id ON clubs_users(club_id);
CREATE INDEX idx_clubs_users_user_id ON clubs_users(user_id);

-- Вставка глобального сообщества по умолчанию
INSERT INTO clubs (id, name, description) VALUES 
    ('global', 'Глобальное сообщество', 'Основное сообщество для всех пользователей GoPadel');

-- Добавление всех существующих пользователей в глобальный клуб
INSERT INTO clubs_users (club_id, user_id)
SELECT 'global', id FROM users;

-- Этап 3: Добавление связи tournaments с clubs
-- Добавляем поле club_id для связи турниров с клубами-сообществами
ALTER TABLE tournaments ADD COLUMN club_id VARCHAR(255);

-- Добавляем внешний ключ
ALTER TABLE tournaments ADD CONSTRAINT fk_tournaments_club_community_id FOREIGN KEY (club_id) REFERENCES clubs(id);

-- Добавляем индекс для производительности
CREATE INDEX idx_tournaments_club_community_id ON tournaments(club_id);

-- Устанавливаем всем существующим турнирам club_id = 'global' (глобальное сообщество)
UPDATE tournaments SET club_id = 'global' WHERE club_id IS NULL; 