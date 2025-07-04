-- Add sample registrations with payments

DO $$
DECLARE
    user_alice_id UUID := 'f22f076c-135c-407b-a7d1-3d9f0aefc5fd';
    user_nikita_id UUID := 'b8d8c61f-999b-462c-a0d9-7d2837b565e4';
    user_mary_id UUID := 'dfa0e28a-73ca-4820-8a2b-cf82ba74ac12';
    user_olga_id UUID := 'e1ce7266-c8f8-4921-ac8a-7a2b897b7a25';
    user_alex_id UUID := '273b556a-3d7d-4528-ab78-58a7a5befa2c';
    
    tournament_id_1 UUID;
    tournament_id_2 UUID;
    tournament_id_3 UUID;
    tournament_id_4 UUID;
    tournament_id_5 UUID;
    
    registration_id_1 UUID;
    registration_id_2 UUID;
    registration_id_3 UUID;
    registration_id_4 UUID;
    registration_id_5 UUID;
    registration_id_6 UUID;
    registration_id_7 UUID;
    registration_id_8 UUID;
    registration_id_9 UUID;
    registration_id_10 UUID;
BEGIN
    -- Получаем ID турниров
    SELECT id INTO tournament_id_1 FROM tournaments WHERE name = 'Турнир "Новогодний кубок"' LIMIT 1;
    SELECT id INTO tournament_id_2 FROM tournaments WHERE name = 'Мастерс "Зимний вызов"' LIMIT 1;
    SELECT id INTO tournament_id_3 FROM tournaments WHERE name = 'Открытый турнир "Январский старт"' LIMIT 1;
    SELECT id INTO tournament_id_4 FROM tournaments WHERE name = 'Турнир "Средний уровень"' LIMIT 1;
    SELECT id INTO tournament_id_5 FROM tournaments WHERE name = 'Профессиональный турнир "Элита"' LIMIT 1;
    
    -- Если турниры не найдены, выходим
    IF tournament_id_1 IS NULL OR tournament_id_2 IS NULL OR tournament_id_3 IS NULL OR tournament_id_4 IS NULL OR tournament_id_5 IS NULL THEN
        RAISE NOTICE 'Турниры не найдены, регистрации не будут созданы';
        RETURN;
    END IF;
    
    -- Создаем регистрации с различными статусами
    
    -- 1. Alice - ACTIVE регистрация на Новогодний кубок с успешным платежом
    INSERT INTO registrations (id, user_id, tournament_id, date, status)
    VALUES (gen_random_uuid(), user_alice_id, tournament_id_1, NOW() - INTERVAL '2 days', 'ACTIVE')
    RETURNING id INTO registration_id_1;
    
    -- Платеж для Alice - успешный
    INSERT INTO payments (id, payment_id, date, amount, status, payment_link, confirmation_token, registration_id)
    VALUES (
        gen_random_uuid(),
        'pm_alice_001',
        NOW() - INTERVAL '2 days',
        2000,
        'succeeded',
        'https://yookassa.ru/payments/pm_alice_001',
        'conf_alice_001',
        registration_id_1
    );
    
    -- 2. Nikita - ACTIVE регистрация на Зимний вызов с несколькими платежами
    INSERT INTO registrations (id, user_id, tournament_id, date, status)
    VALUES (gen_random_uuid(), user_nikita_id, tournament_id_2, NOW() - INTERVAL '1 day', 'ACTIVE')
    RETURNING id INTO registration_id_2;
    
    -- Первый платеж Nikita - отменен
    INSERT INTO payments (id, payment_id, date, amount, status, payment_link, confirmation_token, registration_id)
    VALUES (
        gen_random_uuid(),
        'pm_nikita_001',
        NOW() - INTERVAL '1 day',
        1500,
        'canceled',
        'https://yookassa.ru/payments/pm_nikita_001',
        'conf_nikita_001',
        registration_id_2
    );
    
    -- Второй платеж Nikita - успешный
    INSERT INTO payments (id, payment_id, date, amount, status, payment_link, confirmation_token, registration_id)
    VALUES (
        gen_random_uuid(),
        'pm_nikita_002',
        NOW() - INTERVAL '12 hours',
        3000,
        'succeeded',
        'https://yookassa.ru/payments/pm_nikita_002',
        'conf_nikita_002',
        registration_id_2
    );
    
    -- 3. Mary - PENDING регистрация на Январский старт с ожидающим платежом
    INSERT INTO registrations (id, user_id, tournament_id, date, status)
    VALUES (gen_random_uuid(), user_mary_id, tournament_id_3, NOW() - INTERVAL '3 hours', 'PENDING')
    RETURNING id INTO registration_id_3;
    
    -- Платеж для Mary - ожидает подтверждения
    INSERT INTO payments (id, payment_id, date, amount, status, payment_link, confirmation_token, registration_id)
    VALUES (
        gen_random_uuid(),
        'pm_mary_001',
        NOW() - INTERVAL '3 hours',
        1500,
        'waiting_for_capture',
        'https://yookassa.ru/payments/pm_mary_001',
        'conf_mary_001',
        registration_id_3
    );
    
    -- 4. Olga - CANCELED регистрация на Средний уровень с отмененным платежом
    INSERT INTO registrations (id, user_id, tournament_id, date, status)
    VALUES (gen_random_uuid(), user_olga_id, tournament_id_4, NOW() - INTERVAL '5 days', 'CANCELED')
    RETURNING id INTO registration_id_4;
    
    -- Платеж для Olga - отменен
    INSERT INTO payments (id, payment_id, date, amount, status, payment_link, confirmation_token, registration_id)
    VALUES (
        gen_random_uuid(),
        'pm_olga_001',
        NOW() - INTERVAL '5 days',
        2500,
        'canceled',
        'https://yookassa.ru/payments/pm_olga_001',
        'conf_olga_001',
        registration_id_4
    );
    
    -- 5. Alex - CANCELED_BY_USER регистрация на Элиту с ожидающим платежом
    INSERT INTO registrations (id, user_id, tournament_id, date, status)
    VALUES (gen_random_uuid(), user_alex_id, tournament_id_5, NOW() - INTERVAL '1 day', 'CANCELED_BY_USER')
    RETURNING id INTO registration_id_5;
    
    -- Платеж для Alex - в ожидании
    INSERT INTO payments (id, payment_id, date, amount, status, payment_link, confirmation_token, registration_id)
    VALUES (
        gen_random_uuid(),
        'pm_alex_001',
        NOW() - INTERVAL '1 day',
        5000,
        'pending',
        'https://yookassa.ru/payments/pm_alex_001',
        'conf_alex_001',
        registration_id_5
    );
    
    -- 6. Alice - еще одна ACTIVE регистрация на Средний уровень
    INSERT INTO registrations (id, user_id, tournament_id, date, status)
    VALUES (gen_random_uuid(), user_alice_id, tournament_id_4, NOW() - INTERVAL '6 hours', 'ACTIVE')
    RETURNING id INTO registration_id_6;
    
    -- Платеж для Alice - успешный
    INSERT INTO payments (id, payment_id, date, amount, status, payment_link, confirmation_token, registration_id)
    VALUES (
        gen_random_uuid(),
        'pm_alice_002',
        NOW() - INTERVAL '6 hours',
        2500,
        'succeeded',
        'https://yookassa.ru/payments/pm_alice_002',
        'conf_alice_002',
        registration_id_6
    );
    
    -- 7. Nikita - PENDING регистрация на Элиту с несколькими платежами
    INSERT INTO registrations (id, user_id, tournament_id, date, status)
    VALUES (gen_random_uuid(), user_nikita_id, tournament_id_5, NOW() - INTERVAL '4 hours', 'PENDING')
    RETURNING id INTO registration_id_7;
    
    -- Первый платеж Nikita на Элиту - в ожидании
    INSERT INTO payments (id, payment_id, date, amount, status, payment_link, confirmation_token, registration_id)
    VALUES (
        gen_random_uuid(),
        'pm_nikita_003',
        NOW() - INTERVAL '4 hours',
        2500,
        'pending',
        'https://yookassa.ru/payments/pm_nikita_003',
        'conf_nikita_003',
        registration_id_7
    );
    
    -- Второй платеж Nikita на Элиту - ожидает подтверждения
    INSERT INTO payments (id, payment_id, date, amount, status, payment_link, confirmation_token, registration_id)
    VALUES (
        gen_random_uuid(),
        'pm_nikita_004',
        NOW() - INTERVAL '2 hours',
        2500,
        'waiting_for_capture',
        'https://yookassa.ru/payments/pm_nikita_004',
        'conf_nikita_004',
        registration_id_7
    );
    
    -- 8. Mary - ACTIVE регистрация на Новогодний кубок
    INSERT INTO registrations (id, user_id, tournament_id, date, status)
    VALUES (gen_random_uuid(), user_mary_id, tournament_id_1, NOW() - INTERVAL '8 hours', 'ACTIVE')
    RETURNING id INTO registration_id_8;
    
    -- Платеж для Mary - успешный
    INSERT INTO payments (id, payment_id, date, amount, status, payment_link, confirmation_token, registration_id)
    VALUES (
        gen_random_uuid(),
        'pm_mary_002',
        NOW() - INTERVAL '8 hours',
        2000,
        'succeeded',
        'https://yookassa.ru/payments/pm_mary_002',
        'conf_mary_002',
        registration_id_8
    );
    
    -- 9. Olga - PENDING регистрация на Зимний вызов
    INSERT INTO registrations (id, user_id, tournament_id, date, status)
    VALUES (gen_random_uuid(), user_olga_id, tournament_id_2, NOW() - INTERVAL '30 minutes', 'PENDING')
    RETURNING id INTO registration_id_9;
    
    -- Платеж для Olga - в ожидании
    INSERT INTO payments (id, payment_id, date, amount, status, payment_link, confirmation_token, registration_id)
    VALUES (
        gen_random_uuid(),
        'pm_olga_002',
        NOW() - INTERVAL '30 minutes',
        3000,
        'pending',
        'https://yookassa.ru/payments/pm_olga_002',
        'conf_olga_002',
        registration_id_9
    );
    
    -- 10. Alex - ACTIVE регистрация на Январский старт
    INSERT INTO registrations (id, user_id, tournament_id, date, status)
    VALUES (gen_random_uuid(), user_alex_id, tournament_id_3, NOW() - INTERVAL '10 hours', 'ACTIVE')
    RETURNING id INTO registration_id_10;
    
    -- Платеж для Alex - успешный
    INSERT INTO payments (id, payment_id, date, amount, status, payment_link, confirmation_token, registration_id)
    VALUES (
        gen_random_uuid(),
        'pm_alex_002',
        NOW() - INTERVAL '10 hours',
        1500,
        'succeeded',
        'https://yookassa.ru/payments/pm_alex_002',
        'conf_alex_002',
        registration_id_10
    );
    
    RAISE NOTICE 'Создано 10 тестовых регистраций с платежами';
END $$; 