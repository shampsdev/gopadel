-- Добавляем новые столбцы в логическом порядке
ALTER TABLE "clubs" ADD COLUMN "url" VARCHAR(255) UNIQUE DEFAULT NULL;
ALTER TABLE "clubs" ADD COLUMN "is_private" BOOLEAN DEFAULT true;
ALTER TABLE "clubs" ADD COLUMN "updated_at" TIMESTAMP NOT NULL DEFAULT NOW();

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON "clubs" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


INSERT INTO "clubs" ("id", "url", "name", "description", "is_private") VALUES
('46BG2RAXPF', 'yandex', 'Yandex', 'Private Yandex club', true),
('SVO4ZGOIDA', 'global', 'Global', 'GoPadel League global club', false);

UPDATE "clubs_users"
SET "club_id" = 'SVO4ZGOIDA'
WHERE "club_id" = 'global';

UPDATE "clubs_users"
SET "club_id" = '46BG2RAXPF'
WHERE "club_id" = 'yandex';

UPDATE "event"
SET "club_id" = 'SVO4ZGOIDA'
WHERE "club_id" = 'global';

UPDATE "event"
SET "club_id" = '46BG2RAXPF'
WHERE "club_id" = 'yandex';

DELETE FROM "clubs" WHERE "id" IN ('yandex', 'global');
