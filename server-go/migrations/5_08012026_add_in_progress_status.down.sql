-- Откат добавления статуса 'in_progress' из enum event_status

-- Сначала обновляем все события со статусом 'in_progress' на 'registration'
UPDATE "event" SET status = 'registration' WHERE status = 'in_progress';

-- Создаем новый enum без 'in_progress'
CREATE TYPE event_status_new AS ENUM ('registration', 'full', 'completed', 'cancelled');

-- Обновляем таблицу event для использования нового enum
ALTER TABLE "event" ALTER COLUMN status TYPE event_status_new USING status::text::event_status_new;

-- Удаляем старый enum и переименовываем новый
DROP TYPE event_status;
ALTER TYPE event_status_new RENAME TO event_status;
