-- Remove sample registrations and payments

DO $$
DECLARE
    user_alice_id UUID := 'f22f076c-135c-407b-a7d1-3d9f0aefc5fd';
    user_nikita_id UUID := 'b8d8c61f-999b-462c-a0d9-7d2837b565e4';
    user_mary_id UUID := 'dfa0e28a-73ca-4820-8a2b-cf82ba74ac12';
    user_olga_id UUID := 'e1ce7266-c8f8-4921-ac8a-7a2b897b7a25';
    user_alex_id UUID := '273b556a-3d7d-4528-ab78-58a7a5befa2c';
BEGIN
    -- Удаляем платежи для тестовых регистраций
    DELETE FROM payments WHERE payment_id IN (
        'pm_alice_001', 'pm_alice_002',
        'pm_nikita_001', 'pm_nikita_002', 'pm_nikita_003', 'pm_nikita_004',
        'pm_mary_001', 'pm_mary_002',
        'pm_olga_001', 'pm_olga_002',
        'pm_alex_001', 'pm_alex_002'
    );
    
    -- Удаляем регистрации для тестовых пользователей
    DELETE FROM registrations WHERE user_id IN (
        user_alice_id,
        user_nikita_id,
        user_mary_id,
        user_olga_id,
        user_alex_id
    );
    
    RAISE NOTICE 'Удалены тестовые регистрации и платежи';
END $$; 