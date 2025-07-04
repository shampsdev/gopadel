-- Fix tournament ranks according to new rank system
-- New rank system:
-- 0: Beginner (0–1.7)
-- 1: Upper Beginner (1.7–2.7)
-- 2: Intermediate (2.7–3.5)
-- 3: Upper Intermediate (3.5–4.5)
-- 4: Advanced (4.5–6.0)
-- 5: Pro (6.0–7.0)

UPDATE tournaments SET 
    rank_min = CASE 
        -- Beginner tournaments (0-1.7)
        WHEN rank_min <= 1.7 AND rank_max <= 2.0 THEN 0.0
        -- Upper Beginner tournaments (1.7-2.7)
        WHEN rank_min <= 2.0 AND rank_max <= 3.0 THEN 1.7
        -- Intermediate tournaments (2.7-3.5)
        WHEN rank_min <= 3.0 AND rank_max <= 4.0 THEN 2.7
        -- Upper Intermediate tournaments (3.5-4.5)
        WHEN rank_min >= 3.0 AND rank_max <= 5.0 THEN 3.5
        -- Advanced tournaments (4.5-6.0)
        WHEN rank_min >= 4.0 AND rank_max <= 6.0 THEN 4.5
        -- Pro tournaments (6.0-7.0)
        WHEN rank_min >= 5.0 THEN 6.0
        -- Open tournaments (all levels)
        WHEN rank_min = 0.0 AND rank_max = 7.0 THEN 0.0
        -- Default to appropriate level based on current min
        WHEN rank_min <= 1.7 THEN 0.0
        WHEN rank_min <= 2.7 THEN 1.7
        WHEN rank_min <= 3.5 THEN 2.7
        WHEN rank_min <= 4.5 THEN 3.5
        WHEN rank_min <= 6.0 THEN 4.5
        ELSE 6.0
    END,
    rank_max = CASE 
        -- Beginner tournaments (0-1.7)
        WHEN rank_min <= 1.7 AND rank_max <= 2.0 THEN 1.7
        -- Upper Beginner tournaments (1.7-2.7)
        WHEN rank_min <= 2.0 AND rank_max <= 3.0 THEN 2.7
        -- Intermediate tournaments (2.7-3.5)
        WHEN rank_min <= 3.0 AND rank_max <= 4.0 THEN 3.5
        -- Upper Intermediate tournaments (3.5-4.5)
        WHEN rank_min >= 3.0 AND rank_max <= 5.0 THEN 4.5
        -- Advanced tournaments (4.5-6.0)
        WHEN rank_min >= 4.0 AND rank_max <= 6.0 THEN 6.0
        -- Pro tournaments (6.0-7.0)
        WHEN rank_min >= 5.0 THEN 7.0
        -- Open tournaments (all levels)
        WHEN rank_min = 0.0 AND rank_max = 7.0 THEN 7.0
        -- Default to appropriate level based on current max
        WHEN rank_max <= 1.7 THEN 1.7
        WHEN rank_max <= 2.7 THEN 2.7
        WHEN rank_max <= 3.5 THEN 3.5
        WHEN rank_max <= 4.5 THEN 4.5
        WHEN rank_max <= 6.0 THEN 6.0
        ELSE 7.0
    END;

-- Update specific tournaments with better categorization
UPDATE tournaments SET 
    rank_min = 0.0, rank_max = 1.7, 
    description = CONCAT(description, ' [Beginner Level: 0-1.7]')
WHERE name LIKE '%Любительский%' OR name LIKE '%Выходной%';

UPDATE tournaments SET 
    rank_min = 1.7, rank_max = 2.7,
    description = CONCAT(description, ' [Upper Beginner Level: 1.7-2.7]')
WHERE name LIKE '%Корпоративный%' OR name LIKE '%Новогодний%';

UPDATE tournaments SET 
    rank_min = 2.7, rank_max = 3.5,
    description = CONCAT(description, ' [Intermediate Level: 2.7-3.5]')
WHERE name LIKE '%Средний%' OR name LIKE '%Женский%';

UPDATE tournaments SET 
    rank_min = 3.5, rank_max = 4.5,
    description = CONCAT(description, ' [Upper Intermediate Level: 3.5-4.5]')
WHERE name LIKE '%Зимний%' OR name LIKE '%Ночной%';

UPDATE tournaments SET 
    rank_min = 4.5, rank_max = 6.0,
    description = CONCAT(description, ' [Advanced Level: 4.5-6.0]')
WHERE name LIKE '%Мастерс%';

UPDATE tournaments SET 
    rank_min = 6.0, rank_max = 7.0,
    description = CONCAT(description, ' [Pro Level: 6.0-7.0]')
WHERE name LIKE '%Профессиональный%' OR name LIKE '%Элита%';

UPDATE tournaments SET 
    rank_min = 0.0, rank_max = 7.0,
    description = CONCAT(description, ' [Open Level: All Ranks Welcome]')
WHERE name LIKE '%Открытый%' OR name LIKE '%Финал%'; 