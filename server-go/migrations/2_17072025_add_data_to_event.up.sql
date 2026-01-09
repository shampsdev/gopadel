-- Добавление поля data к таблице event
ALTER TABLE "event" ADD COLUMN data JSONB;

-- Добавляем комментарий
COMMENT ON COLUMN "event"."data" IS 'JSONB поле для хранения дополнительных данных события (результаты турниров, структура матчей и т.д.)';

-- Добавляем новые статусы регистрации
ALTER TYPE registrationstatus ADD VALUE 'CANCELLED';
ALTER TYPE registrationstatus ADD VALUE 'LEFT';
ALTER TYPE registrationstatus ADD VALUE 'INVITED';

-- Исправляем существующие события с некорректными рангами
UPDATE "event" 
SET rank_min = 0 
WHERE rank_min < 0;

UPDATE "event" 
SET rank_min = 7 
WHERE rank_min > 7;

UPDATE "event" 
SET rank_max = 0 
WHERE rank_max < 0;

UPDATE "event" 
SET rank_max = 7 
WHERE rank_max > 7;

-- Исправляем случаи где rank_min > rank_max
UPDATE "event" 
SET rank_max = rank_min 
WHERE rank_min > rank_max;

-- Исправляем события с некорректным max_users
UPDATE "event" 
SET max_users = 2 
WHERE max_users <= 0;

-- Добавляем ограничения на ранги (0-7)
ALTER TABLE "event" ADD CONSTRAINT check_rank_min_range CHECK (rank_min >= 0 AND rank_min <= 7);
ALTER TABLE "event" ADD CONSTRAINT check_rank_max_range CHECK (rank_max >= 0 AND rank_max <= 7);
ALTER TABLE "event" ADD CONSTRAINT check_rank_order CHECK (rank_min <= rank_max);

-- Добавляем ограничение на max_users (больше 0)
ALTER TABLE "event" ADD CONSTRAINT check_max_users_positive CHECK (max_users > 0);