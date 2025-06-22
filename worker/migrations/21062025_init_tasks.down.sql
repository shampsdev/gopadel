DROP TRIGGER IF EXISTS set_updated_at ON tasks;
DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS tasks;

DROP TYPE IF EXISTS task_type;
DROP TYPE IF EXISTS task_status;
