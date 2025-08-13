-- Откат обновления модели клубов
-- Восстанавливаем старые клубы
INSERT INTO "clubs" ("id", "name", "description") VALUES
('global', 'Глобальное сообщество', 'Основное сообщество для всех пользователей GoPadel'),
('yandex', 'Yandex', 'Private Yandex club');

-- Обновляем связи обратно
UPDATE "clubs_users"
SET "club_id" = 'global'
WHERE "club_id" = '9UGJELP8SVO';

UPDATE "clubs_users"
SET "club_id" = 'yandex'
WHERE "club_id" = '46BG2RAXPF';

UPDATE "event"
SET "club_id" = 'global'
WHERE "club_id" = '9UGJELP8SVO';

UPDATE "event"
SET "club_id" = 'yandex'
WHERE "club_id" = '46BG2RAXPF';

-- Удаляем новые клубы
DELETE FROM "clubs" WHERE "id" IN ('46BG2RAXPF', '9UGJELP8SVO');

-- Удаляем триггер
DROP TRIGGER IF EXISTS update_clubs_updated_at ON "clubs";

-- Удаляем добавленные столбцы
ALTER TABLE "clubs" DROP COLUMN IF EXISTS "is_private";
ALTER TABLE "clubs" DROP COLUMN IF EXISTS "updated_at";
ALTER TABLE "clubs" DROP COLUMN IF EXISTS "url"; 