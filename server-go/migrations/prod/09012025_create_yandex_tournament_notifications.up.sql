-- Создание задач уведомлений для турниров клуба yandex
-- Создаются напоминания за 48 и 24 часа до турниров для всех активных регистраций

-- Функция для создания задач уведомлений
DO $$
DECLARE
    tournament_record RECORD;
    registration_record RECORD;
    reminder_48h TIMESTAMP;
    reminder_24h TIMESTAMP;
    task_data JSONB;
    task_id UUID;
BEGIN
    -- Проходим по всем турнирам клуба yandex
    FOR tournament_record IN 
        SELECT id, name, start_time, price
        FROM tournaments 
        WHERE club_id = 'yandex' 
        AND start_time > NOW()
    LOOP
        -- Вычисляем время напоминаний
        reminder_48h := tournament_record.start_time - INTERVAL '48 hours';
        reminder_24h := tournament_record.start_time - INTERVAL '24 hours';
        
        -- Проходим по всем активным регистрациям на этот турнир
        FOR registration_record IN
            SELECT r.*, u.telegram_id, u.first_name, u.last_name
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            WHERE r.tournament_id = tournament_record.id
            AND r.status = 'ACTIVE'
            AND u.telegram_id IS NOT NULL
        LOOP
            -- Создаем задачу напоминания за 48 часов
            IF reminder_48h > NOW() THEN
                -- Формируем данные для задачи
                task_data := jsonb_build_object(
                    'user_telegram_id', registration_record.telegram_id,
                    'tournament_id', tournament_record.id,
                    'tournament_name', tournament_record.name,
                    'is_paid', true
                );
                
                -- Генерируем UUID для задачи
                task_id := gen_random_uuid();
                
                -- Создаем задачу для бесплатного турнира (так как все турниры yandex бесплатные)
                INSERT INTO tasks (
                    id, 
                    task_type, 
                    status, 
                    execute_at, 
                    created_at, 
                    updated_at, 
                    data, 
                    retry_count, 
                    max_retries
                ) VALUES (
                    task_id,
                    'tournament.free.reminder.48hours',
                    'pending',
                    reminder_48h,
                    NOW(),
                    NOW(),
                    task_data,
                    0,
                    3
                );
                
                RAISE NOTICE 'Created 48h reminder task for user % (telegram_id: %) for tournament %', 
                    registration_record.first_name || ' ' || registration_record.last_name,
                    registration_record.telegram_id,
                    tournament_record.name;
            END IF;
            
            -- Создаем задачу напоминания за 24 часа
            IF reminder_24h > NOW() THEN
                -- Формируем данные для задачи
                task_data := jsonb_build_object(
                    'user_telegram_id', registration_record.telegram_id,
                    'tournament_id', tournament_record.id,
                    'tournament_name', tournament_record.name,
                    'is_paid', true
                );
                
                -- Генерируем UUID для задачи
                task_id := gen_random_uuid();
                
                -- Используем обычное напоминание за 24 часа для оплаченных турниров
                INSERT INTO tasks (
                    id, 
                    task_type, 
                    status, 
                    execute_at, 
                    created_at, 
                    updated_at, 
                    data, 
                    retry_count, 
                    max_retries
                ) VALUES (
                    task_id,
                    'tournament.reminder.24hours',
                    'pending',
                    reminder_24h,
                    NOW(),
                    NOW(),
                    task_data,
                    0,
                    3
                );
                
                RAISE NOTICE 'Created 24h reminder task for user % (telegram_id: %) for tournament %', 
                    registration_record.first_name || ' ' || registration_record.last_name,
                    registration_record.telegram_id,
                    tournament_record.name;
            END IF;
        END LOOP;
        
        RAISE NOTICE 'Processed tournament: % (start_time: %)', 
            tournament_record.name, 
            tournament_record.start_time;
    END LOOP;
END $$;

-- Показываем статистику созданных задач
SELECT 
    task_type,
    COUNT(*) as count,
    MIN(execute_at) as earliest_execution,
    MAX(execute_at) as latest_execution
FROM tasks 
WHERE task_type IN ('tournament.free.reminder.48hours', 'tournament.reminder.24hours')
AND created_at >= NOW() - INTERVAL '1 minute'
GROUP BY task_type
ORDER BY task_type; 