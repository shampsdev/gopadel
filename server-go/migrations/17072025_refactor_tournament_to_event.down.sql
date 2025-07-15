-- Откат рефакторинга event обратно в tournament
-- Down миграция для восстановления структуры tournaments и старых registrations

-- Создаем старый enum для registrationstatus
CREATE TYPE registrationstatus_old AS ENUM ('PENDING', 'ACTIVE', 'CANCELED', 'CANCELED_BY_USER');

-- Восстанавливаем старую таблицу tournaments
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT now(),
    end_time TIMESTAMP NOT NULL,
    price INTEGER NOT NULL,
    rank_min FLOAT NOT NULL,
    rank_max FLOAT NOT NULL,
    max_users INTEGER NOT NULL,
    description TEXT,
    court_id UUID NOT NULL REFERENCES courts(id),
    tournament_type VARCHAR(100) NOT NULL DEFAULT 'standard',
    organizator_id UUID NOT NULL REFERENCES users(id),
    club_id VARCHAR(255) REFERENCES clubs(id),
    is_finished BOOLEAN NOT NULL DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_tournaments_rank_min CHECK (rank_min >= 0 AND rank_min <= 7),
    CONSTRAINT ck_tournaments_rank_max CHECK (rank_max >= 0 AND rank_max <= 7),
    CONSTRAINT ck_tournaments_price CHECK (price >= 0)
);

-- Переносим данные из event обратно в tournaments
INSERT INTO tournaments (
    id, name, start_time, end_time, price, rank_min, rank_max, 
    max_users, description, court_id, tournament_type, organizator_id, 
    club_id, is_finished, created_at, updated_at
)
SELECT 
    e.id::UUID,
    e.name,
    e.start_time,
    e.end_time,
    e.price,
    e.rank_min::FLOAT,
    e.rank_max::FLOAT,
    e.max_users,
    e.description,
    e.court_id,
    'standard',
    e.organizer_id,
    e.club_id,
    CASE 
        WHEN e.status = 'completed' THEN true
        ELSE false
    END,
    e.created_at,
    e.updated_at
FROM "event" e;

-- Создаем старую таблицу registrations
CREATE TABLE registrations_old (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    date TIMESTAMP NOT NULL DEFAULT now(),
    status registrationstatus_old NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Переносим данные из новой registrations в старую
-- Используем created_at как date
INSERT INTO registrations_old (
    user_id, tournament_id, date, status, created_at, updated_at
)
SELECT 
    r.user_id,
    r.event_id::UUID,
    r.created_at, -- используем created_at как date
    CASE 
        WHEN r.status::text = 'PENDING' THEN 'PENDING'::registrationstatus_old
        WHEN r.status::text = 'CONFIRMED' THEN 'ACTIVE'::registrationstatus_old
        WHEN r.status::text = 'CANCELLED_BEFORE_PAYMENT' THEN 'CANCELED'::registrationstatus_old
        WHEN r.status::text = 'CANCELLED_AFTER_PAYMENT' THEN 'CANCELED_BY_USER'::registrationstatus_old
        WHEN r.status::text = 'REFUNDED' THEN 'CANCELED_BY_USER'::registrationstatus_old
        ELSE 'PENDING'::registrationstatus_old
    END,
    r.created_at,
    r.updated_at
FROM registrations r;

-- Обновляем payments для работы со старой структурой registrations
ALTER TABLE payments DROP CONSTRAINT fk_payments_user_event;
ALTER TABLE payments ADD COLUMN registration_id UUID;

-- Заполняем registration_id в payments
UPDATE payments 
SET registration_id = r.id
FROM registrations_old r 
WHERE payments.user_id = r.user_id AND payments.event_id = r.tournament_id::VARCHAR(255);

-- Удаляем колонки user_id и event_id из payments
ALTER TABLE payments DROP COLUMN user_id;
ALTER TABLE payments DROP COLUMN event_id;

-- Восстанавливаем foreign key для payments
ALTER TABLE payments ADD CONSTRAINT fk_payments_registration_id 
    FOREIGN KEY (registration_id) REFERENCES registrations_old(id);

-- Удаляем новую таблицу registrations и переименовываем старую
DROP TABLE registrations CASCADE;
ALTER TABLE registrations_old RENAME TO registrations;

-- Обновляем waitlists для работы с tournaments
ALTER TABLE waitlists DROP CONSTRAINT fk_waitlists_event_id;
ALTER TABLE waitlists RENAME COLUMN event_id TO tournament_id;
ALTER TABLE waitlists ALTER COLUMN tournament_id TYPE UUID USING tournament_id::UUID;
ALTER TABLE waitlists ADD CONSTRAINT waitlists_tournament_id_fkey 
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id);

-- Создаем индексы для восстановленных таблиц
CREATE INDEX idx_tournaments_court_id ON tournaments(court_id);
CREATE INDEX idx_tournaments_organizator_id ON tournaments(organizator_id);
CREATE INDEX idx_tournaments_club_community_id ON tournaments(club_id);
CREATE INDEX idx_tournaments_is_finished ON tournaments(is_finished);

CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_tournament_id ON registrations(tournament_id);
CREATE INDEX idx_payments_registration_id ON payments(registration_id);
CREATE INDEX idx_waitlists_tournament_id ON waitlists(tournament_id);

-- Создаем triggers для обновления updated_at
CREATE TRIGGER update_tournaments_updated_at 
    BEFORE UPDATE ON tournaments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Удаляем таблицу event
DROP TABLE "event" CASCADE;

-- Восстанавливаем старый enum registrationstatus
DROP TYPE registrationstatus;
ALTER TYPE registrationstatus_old RENAME TO registrationstatus;

-- Удаляем новые enum типы
DROP TYPE event_status;
DROP TYPE event_type;

-- Комментарий
COMMENT ON TABLE tournaments IS 'Восстановленная таблица tournaments после отката рефакторинга';
COMMENT ON TABLE registrations IS 'Восстановленная таблица registrations со старой структурой'; 