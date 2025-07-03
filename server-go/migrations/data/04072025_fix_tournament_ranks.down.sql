-- Rollback tournament ranks to original values
-- This will restore the old ranking system

UPDATE tournaments SET 
    rank_min = CASE 
        WHEN rank_min = 0.0 AND rank_max = 1.7 THEN 0.0
        WHEN rank_min = 1.7 AND rank_max = 2.7 THEN 1.0
        WHEN rank_min = 2.7 AND rank_max = 3.5 THEN 2.0
        WHEN rank_min = 3.5 AND rank_max = 4.5 THEN 3.0
        WHEN rank_min = 4.5 AND rank_max = 6.0 THEN 4.0
        WHEN rank_min = 6.0 AND rank_max = 7.0 THEN 5.0
        WHEN rank_min = 0.0 AND rank_max = 7.0 THEN 0.0
        ELSE rank_min
    END,
    rank_max = CASE 
        WHEN rank_min = 0.0 AND rank_max = 1.7 THEN 3.0
        WHEN rank_min = 1.7 AND rank_max = 2.7 THEN 4.0
        WHEN rank_min = 2.7 AND rank_max = 3.5 THEN 4.0
        WHEN rank_min = 3.5 AND rank_max = 4.5 THEN 5.0
        WHEN rank_min = 4.5 AND rank_max = 6.0 THEN 6.0
        WHEN rank_min = 6.0 AND rank_max = 7.0 THEN 7.0
        WHEN rank_min = 0.0 AND rank_max = 7.0 THEN 7.0
        ELSE rank_max
    END;

-- Remove level descriptions from tournament descriptions
UPDATE tournaments SET 
    description = REPLACE(description, ' [Beginner Level: 0-1.7]', '')
WHERE description LIKE '% [Beginner Level: 0-1.7]';

UPDATE tournaments SET 
    description = REPLACE(description, ' [Upper Beginner Level: 1.7-2.7]', '')
WHERE description LIKE '% [Upper Beginner Level: 1.7-2.7]';

UPDATE tournaments SET 
    description = REPLACE(description, ' [Intermediate Level: 2.7-3.5]', '')
WHERE description LIKE '% [Intermediate Level: 2.7-3.5]';

UPDATE tournaments SET 
    description = REPLACE(description, ' [Upper Intermediate Level: 3.5-4.5]', '')
WHERE description LIKE '% [Upper Intermediate Level: 3.5-4.5]';

UPDATE tournaments SET 
    description = REPLACE(description, ' [Advanced Level: 4.5-6.0]', '')
WHERE description LIKE '% [Advanced Level: 4.5-6.0]';

UPDATE tournaments SET 
    description = REPLACE(description, ' [Pro Level: 6.0-7.0]', '')
WHERE description LIKE '% [Pro Level: 6.0-7.0]';

UPDATE tournaments SET 
    description = REPLACE(description, ' [Open Level: All Ranks Welcome]', '')
WHERE description LIKE '% [Open Level: All Ranks Welcome]'; 