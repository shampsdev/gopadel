-- Обновление enum task_type для новой системы уведомлений
-- Заменяем 3 типа напоминаний об оплате на 2 новых напоминания + напоминание для бесплатных турниров

-- Сначала добавляем новые типы
ALTER TYPE task_type ADD VALUE 'tournament.reminder.48hours';
ALTER TYPE task_type ADD VALUE 'tournament.reminder.24hours';
ALTER TYPE task_type ADD VALUE 'tournament.free.reminder.48hours';

-- Удаляем старые типы задач из базы (если есть)
-- Сначала удаляем все задачи со старыми типами
DELETE FROM tasks WHERE task_type IN (
    'tournament.payment.reminder.1',
    'tournament.payment.reminder.2', 
    'tournament.payment.reminder.3'
);

-- Затем создаем новый enum без старых типов
ALTER TYPE task_type RENAME TO task_type_old;

CREATE TYPE task_type AS ENUM (
    'tournament.registration.success',
    'tournament.reminder.48hours',
    'tournament.reminder.24hours',
    'tournament.free.reminder.48hours',
    'tournament.payment.success',
    'tournament.loyalty.changed',
    'tournament.registration.canceled',
    'tournament.registration.auto_delete_unpaid',
    'tournament.tasks.cancel'
);

-- Обновляем таблицу для использования нового enum
ALTER TABLE tasks ALTER COLUMN task_type TYPE task_type USING task_type::text::task_type;

-- Удаляем старый enum
DROP TYPE task_type_old; 