-- Remove sample tournaments

-- Delete tournaments created by the up migration
DELETE FROM tournaments WHERE name IN (
    'Турнир "Новогодний кубок"',
    'Мастерс "Зимний вызов"',
    'Открытый турнир "Январский старт"',
    'Турнир "Средний уровень"',
    'Профессиональный турнир "Элита"',
    'Любительский турнир "Выходной"',
    'Турнир "Корпоративный"',
    'Женский турнир "Леди Падель"',
    'Турнир "Ночной"',
    'Турнир "Финал месяца"'
);

-- Optionally remove the test user if it was created (be careful with this in production)
DELETE FROM users WHERE telegram_id = 999999999 AND first_name = 'Тестовый' AND second_name = 'Организатор'; 