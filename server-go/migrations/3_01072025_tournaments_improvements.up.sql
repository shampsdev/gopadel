-- Объединенная миграция улучшений для tournaments
-- Объединяет следующие миграции:
-- - add_is_finished_to_tournaments
-- - 04072025_endtime_and_rename_clubs
-- - 05072025_create_clubs_with_tournaments
-- - 09072025_expand_domain_models

-- Этап 1: Переименование clubs в courts
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

-- Этап 2: Добавление NOT NULL к end_time
-- Для существующих турниров, где end_time IS NULL, выставить start_time + interval '1 hour'
UPDATE tournaments SET end_time = start_time + interval '1 hour' WHERE end_time IS NULL;

-- Сделать поле end_time NOT NULL
ALTER TABLE tournaments ALTER COLUMN end_time SET NOT NULL;

-- Этап 3: Добавляем поле is_finished в таблицу tournaments
ALTER TABLE tournaments ADD COLUMN is_finished BOOLEAN NOT NULL DEFAULT FALSE;

-- Создаем индекс для поля is_finished для быстрого поиска
CREATE INDEX idx_tournaments_is_finished ON tournaments(is_finished);

-- Этап 4: Создание таблицы clubs (communities)
CREATE TABLE clubs (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Создание таблицы clubs_users (many-to-many relationship)
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

-- Добавление связи tournaments с clubs
-- Добавляем поле club_id для связи турниров с клубами-сообществами
ALTER TABLE tournaments ADD COLUMN club_id VARCHAR(255);

-- Добавляем внешний ключ
ALTER TABLE tournaments ADD CONSTRAINT fk_tournaments_club_community_id FOREIGN KEY (club_id) REFERENCES clubs(id);

-- Добавляем индекс для производительности
CREATE INDEX idx_tournaments_club_community_id ON tournaments(club_id);

-- Устанавливаем всем существующим турнирам club_id = 'global' (глобальное сообщество)
UPDATE tournaments SET club_id = 'global' WHERE club_id IS NULL;

-- Этап 5: Добавление полей created_at и updated_at ко всем таблицам
-- Add CreatedAt and UpdatedAt to all tables
ALTER TABLE users ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE courts ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE courts ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE tournaments ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE tournaments ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE registrations ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE registrations ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE payments ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Create function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for courts table 
CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for tournaments table
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for registrations table
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for payments table
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for clubs table
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Этап 6: Добавление data колонки для tournaments
ALTER TABLE tournaments ADD COLUMN data JSONB;
COMMENT ON COLUMN tournaments.data IS 'JSONB поле для хранения результатов турнира и других дополнительных данных'; 