-- Добавляем новый статус 'in_progress' в enum event_status
-- Этот статус означает, что событие началось и состав участников заблокирован

-- Добавляем новое значение в enum
ALTER TYPE event_status ADD VALUE 'in_progress';

-- Комментарий для будущих разработчиков
COMMENT ON TYPE event_status IS 'Статусы событий: registration (регистрация открыта), full (набор закрыт), in_progress (событие в процессе, состав заблокирован), completed (завершено), cancelled (отменено)';
