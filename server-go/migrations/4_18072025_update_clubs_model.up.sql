-- Добавляем новые столбцы в логическом порядке
ALTER TABLE "clubs" ADD COLUMN "url" VARCHAR(255) UNIQUE DEFAULT NULL;
ALTER TABLE "clubs" ADD COLUMN "is_private" BOOLEAN DEFAULT true;
ALTER TABLE "clubs" ADD COLUMN "updated_at" TIMESTAMP NOT NULL DEFAULT NOW();

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON "clubs" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();