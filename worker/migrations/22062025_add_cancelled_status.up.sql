ALTER TYPE task_status ADD VALUE 'cancelled';

DROP INDEX IF EXISTS idx_tasks_ready;
CREATE INDEX idx_tasks_ready ON tasks (execute_at) WHERE status = 'pending';

CREATE INDEX idx_tasks_cancelled ON tasks (status, created_at) WHERE status = 'cancelled';

CREATE INDEX idx_tasks_type_status ON tasks (task_type, status);