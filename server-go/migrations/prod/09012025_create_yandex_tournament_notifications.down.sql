-- Откат миграции: удаление созданных задач уведомлений для турниров клуба yandex
-- Удаляются все задачи, созданные для турниров клуба yandex

DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Удаляем задачи уведомлений для турниров клуба yandex
    -- Ищем задачи по tournament_id, которые относятся к турнирам клуба yandex
    WITH yandex_tournaments AS (
        SELECT id 
        FROM tournaments 
        WHERE club_id = 'yandex'
    ),
    tasks_to_delete AS (
        SELECT t.id
        FROM tasks t
        WHERE t.task_type IN (
            'tournament.free.reminder.48hours',
            'tournament.reminder.24hours'
        )
        AND t.status = 'pending'
        AND (t.data->>'tournament_id')::text IN (
            SELECT id::text FROM yandex_tournaments
        )
    )
    DELETE FROM tasks 
    WHERE id IN (SELECT id FROM tasks_to_delete);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % notification tasks for yandex tournaments', deleted_count;
END $$;

-- Показываем оставшиеся задачи для турниров yandex (должно быть 0)
SELECT 
    task_type,
    COUNT(*) as remaining_count
FROM tasks t
WHERE t.task_type IN (
    'tournament.free.reminder.48hours',
    'tournament.reminder.24hours'
)
AND (t.data->>'tournament_id')::text IN (
    SELECT id::text 
    FROM tournaments 
    WHERE club_id = 'yandex'
)
GROUP BY task_type
ORDER BY task_type; 