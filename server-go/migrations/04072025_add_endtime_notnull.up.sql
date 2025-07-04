 -- 1. Для существующих турниров, где end_time IS NULL, выставить start_time + interval '1 hour'
UPDATE tournaments SET end_time = start_time + interval '1 hour' WHERE end_time IS NULL;

-- 2. Сделать поле end_time NOT NULL
ALTER TABLE tournaments ALTER COLUMN end_time SET NOT NULL;
