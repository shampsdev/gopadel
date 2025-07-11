-- Удаляем индекс для поля is_finished
DROP INDEX IF EXISTS idx_tournaments_is_finished;

-- Удаляем поле is_finished из таблицы tournaments
ALTER TABLE tournaments DROP COLUMN IF EXISTS is_finished; 