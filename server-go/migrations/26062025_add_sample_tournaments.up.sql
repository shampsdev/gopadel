-- Add 10 sample tournaments

-- First, let's ensure we have at least one user and one club
DO $$
DECLARE
    default_user_id UUID;
    default_club_id UUID;
BEGIN
    -- Get the first user as default organizer
    SELECT id INTO default_user_id FROM users ORDER BY telegram_id LIMIT 1;
    
    -- If no users exist, create a default one
    IF default_user_id IS NULL THEN
        INSERT INTO users (telegram_id, first_name, second_name, rank, loyalty_id, is_registered, bio)
        VALUES (999999999, 'Тестовый', 'Организатор', 3.5, 1, true, 'Тестовый пользователь для организации турниров')
        RETURNING id INTO default_user_id;
    END IF;
    
    -- Get the first club
    SELECT id INTO default_club_id FROM clubs LIMIT 1;
    
    -- Insert 10 sample tournaments
    INSERT INTO tournaments (name, start_time, end_time, price, rank_min, rank_max, max_users, description, club_id, tournament_type, organizator_id) VALUES
    ('Турнир "Новогодний кубок"', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 3 hours', 2000, 1.0, 4.0, 16, 'Новогодний турнир для игроков всех уровней. Призы для победителей!', default_club_id, 'Американо', default_user_id),
    
    ('Мастерс "Зимний вызов"', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 4 hours', 3000, 3.0, 5.0, 12, 'Турнир для опытных игроков. Высокий уровень игры гарантирован.', default_club_id, 'Мексиканка', default_user_id),
    
    ('Открытый турнир "Январский старт"', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 2 hours', 1500, 0.0, 7.0, 20, 'Открытый турнир для всех желающих. Отличная возможность начать год с побед!', default_club_id, 'Американо', default_user_id),
    
    ('Турнир "Средний уровень"', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days 3 hours', 2500, 2.0, 4.0, 16, 'Турнир для игроков среднего уровня. Равные возможности для всех участников.', default_club_id, 'Американо', default_user_id),
    
    ('Профессиональный турнир "Элита"', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days 5 hours', 5000, 4.0, 7.0, 8, 'Турнир для профессиональных игроков. Только высший уровень!', default_club_id, 'Мексиканка', default_user_id),
    
    ('Любительский турнир "Выходной"', NOW() + INTERVAL '12 days', NOW() + INTERVAL '12 days 2 hours', 1000, 0.0, 3.0, 24, 'Расслабленный турнир для любителей. Отличное настроение гарантировано!', default_club_id, 'Без типа', default_user_id),
    
    ('Турнир "Корпоративный"', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days 3 hours', 1800, 1.0, 5.0, 16, 'Корпоративный турнир для сотрудников компаний. Командный дух и здоровая конкуренция!', default_club_id, 'Американо', default_user_id),
    
    ('Женский турнир "Леди Падель"', NOW() + INTERVAL '16 days', NOW() + INTERVAL '16 days 3 hours', 2200, 1.0, 6.0, 12, 'Специальный турнир для женщин. Поддержка и вдохновение!', default_club_id, 'Американо', default_user_id),
    
    ('Турнир "Ночной"', NOW() + INTERVAL '18 days', NOW() + INTERVAL '18 days 4 hours', 2800, 2.0, 5.0, 16, 'Вечерний турнир для тех, кто любит играть под звездами. Особая атмосфера!', default_club_id, 'Мексиканка', default_user_id),
    
    ('Турнир "Финал месяца"', NOW() + INTERVAL '20 days', NOW() + INTERVAL '20 days 4 hours', 3500, 1.0, 7.0, 20, 'Грандиозный финал месяца! Все уровни, большие призы, незабываемые эмоции!', default_club_id, 'Американо', default_user_id);
    
END $$; 