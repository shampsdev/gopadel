-- Добавление поля data к таблице event
ALTER TABLE "event" ADD COLUMN data JSONB;

-- Добавляем комментарий
COMMENT ON COLUMN "event"."data" IS 'JSONB поле для хранения дополнительных данных события (результаты турниров, структура матчей и т.д.)'; 