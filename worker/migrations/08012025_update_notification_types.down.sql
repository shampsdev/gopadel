-- Откат изменений enum task_type к старой системе уведомлений

-- Удаляем все задачи с новыми типами
DELETE FROM tasks WHERE task_type IN (
    'tournament.reminder.48hours',
    'tournament.reminder.24hours',
    'tournament.free.reminder.48hours'
);

-- Создаем старый enum
ALTER TYPE task_type RENAME TO task_type_new;

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

-- Обновляем таблицу для использования старого enum
ALTER TABLE tasks ALTER COLUMN task_type TYPE task_type USING task_type::text::task_type;

-- Удаляем новый enum
DROP TYPE task_type_new; 