DROP INDEX IF EXISTS idx_tasks_type_status;
DROP INDEX IF EXISTS idx_tasks_cancelled;

DROP INDEX IF EXISTS idx_tasks_ready;
CREATE INDEX idx_tasks_ready ON tasks (execute_at) WHERE status = 'pending';

UPDATE tasks SET status = 'failed' WHERE status = 'cancelled';

CREATE TYPE task_status_new AS ENUM (
    'pending',
    'processing', 
    'completed',
    'failed'
);

ALTER TABLE tasks ALTER COLUMN status TYPE task_status_new USING status::text::task_status_new;

DROP TYPE task_status;
ALTER TYPE task_status_new RENAME TO task_status; 