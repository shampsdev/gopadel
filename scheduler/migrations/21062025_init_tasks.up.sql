CREATE TYPE task_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);

CREATE TYPE task_type AS ENUM (
    'tournament.registration.success',
    'tournament.payment.reminder.1',
    'tournament.payment.reminder.2', 
    'tournament.payment.reminder.3',
    'tournament.payment.success',
    'tournament.loyalty.changed',
    'tournament.registration.canceled',
    'tournament.registration.auto_delete_unpaid',
    'tournament.tasks.cancel'
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    task_type task_type NOT NULL,
    status task_status NOT NULL DEFAULT 'pending',

    execute_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    data JSONB NOT NULL DEFAULT '{}',
    result JSONB,
    error_message TEXT,

    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3
);

CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_execute_at ON tasks (execute_at);
CREATE INDEX idx_tasks_ready ON tasks (execute_at) WHERE status = 'pending';


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
