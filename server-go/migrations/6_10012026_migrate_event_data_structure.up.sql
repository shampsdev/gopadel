-- Миграция структуры данных event.data к новой архитектуре
-- Сохраняем существующие данные и переводим их в новый формат

-- Создаем временную таблицу для бэкапа старых данных
CREATE TABLE event_data_backup AS 
SELECT id, data, type, status FROM "event" WHERE data IS NOT NULL;

-- Функция для миграции данных турниров
CREATE OR REPLACE FUNCTION migrate_tournament_data()
RETURNS void AS $$
DECLARE
    event_record RECORD;
    old_data JSONB;
    new_data JSONB;
    tournament_type TEXT;
    result_data JSONB;
BEGIN
    -- Обрабатываем каждое событие с данными
    FOR event_record IN 
        SELECT id, data, type FROM "event" 
        WHERE data IS NOT NULL AND type = 'tournament'
    LOOP
        old_data := event_record.data;
        
        -- Определяем тип турнира из старых данных
        tournament_type := 'AMERICANO'; -- по умолчанию
        
        IF old_data ? 'tournament' THEN
            IF old_data->'tournament'->>'type' = 'Американо' THEN
                tournament_type := 'AMERICANO';
            ELSIF old_data->'tournament'->>'type' = 'Мексикано' THEN
                tournament_type := 'MEXICANO';
            ELSIF old_data->'tournament'->>'type' = 'Тренировка' THEN
                tournament_type := 'TRAINING';
            END IF;
        END IF;
        
        -- Извлекаем результаты если есть
        result_data := COALESCE(old_data->'result', '{}'::jsonb);
        
        -- Создаем новую структуру данных
        new_data := jsonb_build_object(
            'domain', 'tournament',
            'tournament', jsonb_build_object(
                'format', tournament_type,
                'mode', 'SOLO'
            ),
            'tournamentEngine', jsonb_build_object(
                'config', jsonb_build_object(
                    'matchPoints', 16,
                    'courtsCount', 1,
                    'roundsCount', 0
                ),
                'state', jsonb_build_object(
                    'status', 'NOT_STARTED',
                    'currentRound', 0
                ),
                'participants', '[]'::jsonb,
                'matches', '[]'::jsonb,
                'leaderboard', '[]'::jsonb
            ),
            'result', result_data
        );
        
        -- Обновляем запись
        UPDATE "event" 
        SET data = new_data 
        WHERE id = event_record.id;
        
        RAISE NOTICE 'Migrated tournament event %: % -> %', 
            event_record.id, tournament_type, new_data->'domain';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Функция для миграции данных игр
CREATE OR REPLACE FUNCTION migrate_game_data()
RETURNS void AS $$
DECLARE
    event_record RECORD;
    old_data JSONB;
    new_data JSONB;
    game_type TEXT;
BEGIN
    -- Обрабатываем каждое событие типа game
    FOR event_record IN 
        SELECT id, data, type FROM "event" 
        WHERE data IS NOT NULL AND type = 'game'
    LOOP
        old_data := event_record.data;
        
        -- Определяем тип игры из старых данных
        game_type := 'Обычная игра'; -- по умолчанию
        
        IF old_data ? 'game' THEN
            game_type := COALESCE(old_data->'game'->>'type', 'Обычная игра');
        END IF;
        
        -- Создаем новую структуру данных для игры
        new_data := jsonb_build_object(
            'domain', 'game',
            'game', jsonb_build_object(
                'type', game_type,
                'format', 'CASUAL'
            ),
            'matchEngine', jsonb_build_object(
                'config', jsonb_build_object(
                    'matchPoints', 16,
                    'sets', 1
                ),
                'state', jsonb_build_object(
                    'status', 'NOT_STARTED'
                ),
                'score', jsonb_build_object(
                    'teamA', 0,
                    'teamB', 0
                )
            ),
            'result', jsonb_build_object()
        );
        
        -- Обновляем запись
        UPDATE "event" 
        SET data = new_data 
        WHERE id = event_record.id;
        
        RAISE NOTICE 'Migrated game event %: %', event_record.id, game_type;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Функция для миграции данных тренировок
CREATE OR REPLACE FUNCTION migrate_training_data()
RETURNS void AS $$
DECLARE
    event_record RECORD;
    old_data JSONB;
    new_data JSONB;
BEGIN
    -- Обрабатываем каждое событие типа training
    FOR event_record IN 
        SELECT id, data, type FROM "event" 
        WHERE data IS NOT NULL AND type = 'training'
    LOOP
        old_data := event_record.data;
        
        -- Создаем новую структуру данных для тренировки
        new_data := jsonb_build_object(
            'domain', 'training',
            'training', jsonb_build_object(
                'type', 'Тренировка',
                'level', 'BEGINNER'
            ),
            'sessionEngine', jsonb_build_object(
                'config', jsonb_build_object(
                    'duration', 90,
                    'exercises', '[]'::jsonb
                ),
                'state', jsonb_build_object(
                    'status', 'NOT_STARTED'
                )
            ),
            'result', jsonb_build_object()
        );
        
        -- Обновляем запись
        UPDATE "event" 
        SET data = new_data 
        WHERE id = event_record.id;
        
        RAISE NOTICE 'Migrated training event %', event_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Выполняем миграцию данных
SELECT migrate_tournament_data();
SELECT migrate_game_data();
SELECT migrate_training_data();

-- Обрабатываем события без данных или с пустыми данными
UPDATE "event" 
SET data = jsonb_build_object(
    'domain', 'tournament',
    'tournament', jsonb_build_object(
        'format', 'AMERICANO',
        'mode', 'SOLO'
    ),
    'tournamentEngine', jsonb_build_object(
        'config', jsonb_build_object(
            'matchPoints', 16,
            'courtsCount', 1,
            'roundsCount', 0
        ),
            'state', jsonb_build_object(
                'status', 'NOT_STARTED',
                'currentRound', 0
            ),
        'participants', '[]'::jsonb,
        'matches', '[]'::jsonb,
        'leaderboard', '[]'::jsonb
    ),
    'result', jsonb_build_object()
)
WHERE data IS NULL AND type = 'tournament';

UPDATE "event" 
SET data = jsonb_build_object(
    'domain', 'game',
    'game', jsonb_build_object(
        'type', 'Обычная игра',
        'format', 'CASUAL'
    ),
    'matchEngine', jsonb_build_object(
        'config', jsonb_build_object(
            'matchPoints', 16,
            'sets', 1
        ),
        'state', jsonb_build_object(
            'status', 'PENDING'
        ),
        'score', jsonb_build_object(
            'teamA', 0,
            'teamB', 0
        )
    ),
    'result', jsonb_build_object()
)
WHERE data IS NULL AND type = 'game';

UPDATE "event" 
SET data = jsonb_build_object(
    'domain', 'training',
    'training', jsonb_build_object(
        'type', 'Тренировка',
        'level', 'BEGINNER'
    ),
    'sessionEngine', jsonb_build_object(
        'config', jsonb_build_object(
            'duration', 90,
            'exercises', '[]'::jsonb
        ),
        'state', jsonb_build_object(
            'status', 'NOT_STARTED'
        )
    ),
    'result', jsonb_build_object()
)
WHERE data IS NULL AND type = 'training';

-- Удаляем временные функции
DROP FUNCTION IF EXISTS migrate_tournament_data();
DROP FUNCTION IF EXISTS migrate_game_data();
DROP FUNCTION IF EXISTS migrate_training_data();

-- Создаем индексы для новой структуры данных
CREATE INDEX IF NOT EXISTS idx_event_data_domain ON "event" USING GIN ((data->'domain'));
CREATE INDEX IF NOT EXISTS idx_event_tournament_format ON "event" USING GIN ((data->'tournament'->'format'));
CREATE INDEX IF NOT EXISTS idx_event_tournament_engine_status ON "event" USING GIN ((data->'tournamentEngine'->'state'->'status'));

-- Комментарии для документации
COMMENT ON TABLE event_data_backup IS 'Бэкап старых данных event.data перед миграцией к новой структуре';
COMMENT ON INDEX idx_event_data_domain IS 'Индекс для быстрого поиска по домену события (tournament/game/training)';
COMMENT ON INDEX idx_event_tournament_format IS 'Индекс для поиска турниров по формату (AMERICANO/MEXICANO)';
COMMENT ON INDEX idx_event_tournament_engine_status IS 'Индекс для поиска турниров по статусу';
