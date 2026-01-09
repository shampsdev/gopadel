-- Откат удаления поля isFinished из tournamentEngine.state
-- Восстанавливаем поле isFinished на основе статуса турнира

-- Функция для восстановления поля isFinished
CREATE OR REPLACE FUNCTION restore_isfinished_field()
RETURNS void AS $$
DECLARE
    event_record RECORD;
    event_data JSONB;
    tournament_engine JSONB;
    tournament_state JSONB;
    is_finished BOOLEAN;
BEGIN
    -- Обрабатываем каждое событие с данными турнира
    FOR event_record IN 
        SELECT id, data FROM "event" 
        WHERE data IS NOT NULL 
        AND data->>'domain' = 'tournament'
        AND data->'tournamentEngine'->'state' IS NOT NULL
    LOOP
        event_data := event_record.data;
        tournament_engine := event_data->'tournamentEngine';
        tournament_state := tournament_engine->'state';
        
        -- Определяем значение isFinished на основе статуса
        is_finished := (tournament_state->>'status' = 'FINISHED');
        
        -- Добавляем поле isFinished в state
        tournament_state := jsonb_set(tournament_state, '{isFinished}', to_jsonb(is_finished));
        
        -- Обновляем tournamentEngine
        tournament_engine := jsonb_set(tournament_engine, '{state}', tournament_state);
        
        -- Обновляем event_data
        event_data := jsonb_set(event_data, '{tournamentEngine}', tournament_engine);
        
        -- Сохраняем обновленные данные
        UPDATE "event" 
        SET data = event_data 
        WHERE id = event_record.id;
        
        RAISE NOTICE 'Restored isFinished field for tournament event %', event_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Выполняем восстановление поля isFinished
SELECT restore_isfinished_field();

-- Удаляем временную функцию
DROP FUNCTION IF EXISTS restore_isfinished_field();

-- Комментарий для документации
COMMENT ON COLUMN "event"."data" IS 'JSONB поле для хранения дополнительных данных события (результаты турниров, структура матчей и т.д.)';
