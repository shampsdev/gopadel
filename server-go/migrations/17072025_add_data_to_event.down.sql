-- Удаление поля data из таблицы event
ALTER TABLE "event" DROP COLUMN data;

-- Удаляем новые статусы регистрации (PostgreSQL не поддерживает DROP VALUE, поэтому пересоздаем enum)
ALTER TYPE registrationstatus RENAME TO registrationstatus_old;
CREATE TYPE registrationstatus AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED_BEFORE_PAYMENT', 'CANCELLED_AFTER_PAYMENT', 'REFUNDED');

-- Обновляем колонку с новым типом
ALTER TABLE registrations ALTER COLUMN status TYPE registrationstatus USING status::text::registrationstatus;

-- Удаляем старый тип
DROP TYPE registrationstatus_old; 