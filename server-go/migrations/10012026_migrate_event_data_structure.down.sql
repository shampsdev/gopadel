-- Откат миграции структуры данных event.data

-- Восстанавливаем старые данные из бэкапа
UPDATE "event" 
SET data = backup.data
FROM event_data_backup backup
WHERE "event".id = backup.id;

-- Удаляем новые индексы
DROP INDEX IF EXISTS idx_event_data_domain;
DROP INDEX IF EXISTS idx_event_tournament_format;
DROP INDEX IF EXISTS idx_event_tournament_engine_status;

-- Удаляем таблицу бэкапа
DROP TABLE IF EXISTS event_data_backup;

-- Комментарий
COMMENT ON COLUMN "event"."data" IS 'JSONB поле для хранения дополнительных данных события (результаты турниров, структура матчей и т.д.)';
