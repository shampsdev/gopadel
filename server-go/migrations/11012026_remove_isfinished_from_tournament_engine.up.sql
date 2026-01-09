-- Удаление поля isFinished из tournamentEngine.state
-- Это поле дублирует функциональность статуса события

-- Функция для удаления поля isFinished из всех турниров
CREATE OR REPLACE FUNCTION remove_isfinished_field()
RETURNS void AS $$
DECLARE
    event_record RECORD;
    event_data JSONB;
    tournament_engine JSONB;
    tournament_state JSONB;
BEGIN
    -- Обрабатываем каждое событие с данными турнира
    FOR event_record IN 
        SELECT id, data FROM "event" 
        WHERE data IS NOT NULL 
        AND data->>'domain' = 'tournament'
        AND data->'tournamentEngine'->'state' ? 'isFinished'
    LOOP
        event_data := event_record.data;
        tournament_engine := event_data->'tournamentEngine';
        tournament_state := tournament_engine->'state';
        
        -- Удаляем поле isFinished из state
        tournament_state := tournament_state - 'isFinished';
        
        -- Обновляем tournamentEngine
        tournament_engine := jsonb_set(tournament_engine, '{state}', tournament_state);
        
        -- Обновляем event_data
        event_data := jsonb_set(event_data, '{tournamentEngine}', tournament_engine);
        
        -- Сохраняем обновленные данные
        UPDATE "event" 
        SET data = event_data 
        WHERE id = event_record.id;
        
        RAISE NOTICE 'Removed isFinished field from tournament event %', event_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Выполняем удаление поля isFinished
SELECT remove_isfinished_field();

-- Удаляем временную функцию
DROP FUNCTION IF EXISTS remove_isfinished_field();

-- Комментарий для документации
COMMENT ON COLUMN "event"."data" IS 'JSONB поле для хранения дополнительных данных события. Поле isFinished удалено из tournamentEngine.state - используется статус события';
