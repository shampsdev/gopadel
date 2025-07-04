 -- Откат: сделать поле end_time NULLABLE
ALTER TABLE tournaments ALTER COLUMN end_time DROP NOT NULL;
