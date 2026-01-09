-- Откат обновления модели клубов
-- Удаляем триггер
DROP TRIGGER IF EXISTS update_clubs_updated_at ON "clubs";

-- Удаляем добавленные столбцы
ALTER TABLE "clubs" DROP COLUMN IF EXISTS "is_private";
ALTER TABLE "clubs" DROP COLUMN IF EXISTS "updated_at";
ALTER TABLE "clubs" DROP COLUMN IF EXISTS "url"; 