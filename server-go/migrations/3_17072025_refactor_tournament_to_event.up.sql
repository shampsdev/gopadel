-- Рефакторинг tournament в event
-- Миграция для переноса данных из tournaments в events и обновления registrations

-- Создаем новые enum типы для event
CREATE TYPE event_status AS ENUM ('registration', 'full', 'completed', 'cancelled');
CREATE TYPE event_type AS ENUM ('game', 'tournament', 'training');

-- Обновляем enum для registration_status
ALTER TYPE registrationstatus RENAME TO registrationstatus_old;
CREATE TYPE registrationstatus AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED_BEFORE_PAYMENT', 'CANCELLED_AFTER_PAYMENT', 'REFUNDED');

-- Создаем новую таблицу event
CREATE TABLE "event" (
    "id" VARCHAR(255) UNIQUE DEFAULT gen_random_uuid()::VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP NOT NULL DEFAULT now(),
    "end_time" TIMESTAMP NOT NULL DEFAULT now() + INTERVAL '1 hour',
    "rank_min" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank_max" DOUBLE PRECISION NOT NULL DEFAULT 7,
    "price" INTEGER NOT NULL DEFAULT 0,
    "max_users" INTEGER NOT NULL DEFAULT 4,
    "status" event_status NOT NULL DEFAULT 'registration',
    "type" event_type NOT NULL DEFAULT 'tournament',
    "court_id" UUID NOT NULL,
    "organizer_id" UUID NOT NULL,
    "club_id" VARCHAR(255),
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY("id"),
    FOREIGN KEY("court_id") REFERENCES courts(id),
    FOREIGN KEY("organizer_id") REFERENCES users(id),
    FOREIGN KEY("club_id") REFERENCES clubs(id)
);

-- Переносим данные из tournaments в event
INSERT INTO "event" (
    "id", "name", "description", "start_time", "end_time", 
    "rank_min", "rank_max", "price", "max_users", "status", 
    "type", "court_id", "organizer_id", "club_id", "created_at", "updated_at"
)
SELECT 
    t.id::VARCHAR(255),
    t.name,
    t.description,
    t.start_time,
    t.end_time,
    t.rank_min::DOUBLE PRECISION,
    t.rank_max::DOUBLE PRECISION,
    t.price,
    t.max_users,
    CASE 
        WHEN t.is_finished = true THEN 'completed'::event_status
        ELSE 'registration'::event_status
    END,
    'tournament'::event_type,
    t.court_id,
    t.organizator_id,
    t.club_id,
    COALESCE(t.created_at, NOW()),
    COALESCE(t.updated_at, NOW())
FROM tournaments t;

-- Создаем новую таблицу registrations
CREATE TABLE "registrations_new" (
    "user_id" UUID NOT NULL,
    "event_id" VARCHAR(255) NOT NULL,
    "status" registrationstatus NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY("user_id", "event_id"),
    FOREIGN KEY("user_id") REFERENCES users(id),
    FOREIGN KEY("event_id") REFERENCES "event"(id)
);

-- Переносим данные из старой таблицы registrations в новую
-- Исправляем created_at если date < created_at
INSERT INTO "registrations_new" (
    "user_id", "event_id", "status", "created_at", "updated_at"
)
SELECT 
    r.user_id,
    r.tournament_id::VARCHAR(255),
    CASE 
        WHEN r.status::text = 'PENDING' THEN 'PENDING'::registrationstatus
        WHEN r.status::text = 'ACTIVE' THEN 'CONFIRMED'::registrationstatus
        WHEN r.status::text = 'CANCELED' THEN 'CANCELLED_BEFORE_PAYMENT'::registrationstatus
        WHEN r.status::text = 'CANCELED_BY_USER' THEN 'CANCELLED_AFTER_PAYMENT'::registrationstatus
        ELSE 'PENDING'::registrationstatus
    END,
    CASE 
        WHEN r.date < COALESCE(r.created_at, r.date) THEN r.date
        ELSE COALESCE(r.created_at, r.date)
    END,
    COALESCE(r.updated_at, NOW())
FROM registrations r;

-- Обновляем таблицу payments для работы с новой структурой registrations
-- Сначала добавляем временную колонку
ALTER TABLE payments ADD COLUMN temp_user_id UUID;
ALTER TABLE payments ADD COLUMN temp_event_id VARCHAR(255);

-- Заполняем временные колонки
UPDATE payments 
SET temp_user_id = r.user_id, 
    temp_event_id = r.tournament_id::VARCHAR(255)
FROM registrations r 
WHERE payments.registration_id = r.id;

-- Удаляем старую таблицу registrations и переименовываем новую
DROP TABLE registrations CASCADE;
ALTER TABLE registrations_new RENAME TO registrations;

-- Обновляем payments для работы с новой структурой
-- Проверяем, существует ли ограничение перед его удалением
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_payments_registration_id' 
        AND table_name = 'payments'
    ) THEN
        ALTER TABLE payments DROP CONSTRAINT fk_payments_registration_id;
    END IF;
END $$;

ALTER TABLE payments DROP COLUMN registration_id;
ALTER TABLE payments ADD CONSTRAINT fk_payments_user_event 
    FOREIGN KEY (temp_user_id, temp_event_id) REFERENCES registrations(user_id, event_id);

-- Переименовываем временные колонки
ALTER TABLE payments RENAME COLUMN temp_user_id TO user_id;
ALTER TABLE payments RENAME COLUMN temp_event_id TO event_id;

-- Обновляем waitlists для работы с event
-- Сначала удаляем ограничение, если оно существует
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'waitlists_tournament_id_fkey' 
        AND table_name = 'waitlists'
    ) THEN
        ALTER TABLE waitlists DROP CONSTRAINT waitlists_tournament_id_fkey;
    END IF;
END $$;

-- Переименовываем колонку и меняем тип
ALTER TABLE waitlists RENAME COLUMN tournament_id TO event_id;
-- Меняем тип с UUID на VARCHAR(255)
ALTER TABLE waitlists ALTER COLUMN event_id TYPE VARCHAR(255) USING event_id::VARCHAR(255);

-- Добавляем новое ограничение
ALTER TABLE waitlists ADD CONSTRAINT fk_waitlists_event_id FOREIGN KEY (event_id) REFERENCES "event"(id);

-- Создаем индексы для новых таблиц
CREATE INDEX idx_event_court_id ON "event"(court_id);
CREATE INDEX idx_event_organizer_id ON "event"(organizer_id);
CREATE INDEX idx_event_club_id ON "event"(club_id);
CREATE INDEX idx_event_status ON "event"(status);
CREATE INDEX idx_event_type ON "event"(type);
CREATE INDEX idx_event_start_time ON "event"(start_time);

CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_status ON registrations(status);

CREATE INDEX idx_payments_user_event ON payments(user_id, event_id);
CREATE INDEX idx_waitlists_event_id ON waitlists(event_id);

-- Создаем trigger для обновления updated_at в event
CREATE TRIGGER update_event_updated_at 
    BEFORE UPDATE ON "event" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Создаем trigger для обновления updated_at в registrations
CREATE TRIGGER update_registrations_updated_at 
    BEFORE UPDATE ON registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Удаляем старую таблицу tournaments
DROP TABLE tournaments CASCADE;

-- Удаляем старый enum
DROP TYPE registrationstatus_old;

-- Комментарий для будущих разработчиков
COMMENT ON TABLE "event" IS 'Рефакторинговая таблица tournaments -> event. Поддерживает турниры, игры и тренировки';
COMMENT ON TABLE registrations IS 'Обновленная таблица регистраций с составным первичным ключом'; 