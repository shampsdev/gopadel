-- GoPadel Database Initial Data

-- Insert default loyalty levels
INSERT INTO loyalties (id, name, discount, description, requirements) VALUES 
(1, 'Нет', 0, NULL, NULL),
(2, 'GoPadel Active', 5, 'GoPadel Active — участвует от 5 и более турниров подряд — проявляет активность внутри комьюнити. Активисты получат с этой недели 5% скидки на продукты и в будущим от нас мерч.', '{"tournaments_count": 5, "consecutive": true}'),
(3, 'GoPadel Friend', 10, 'GoPadel Friend — Активно участвует в жизни комьюнити, помогает рекомендациями, приводит друзей и т.д. — Суммарно участвовал в 10 и более турнирах или участвует в нескольких видах продуктов (турниры + лига или обучение + лига и т.д.) — Или внес значимый вклад в развитие (привел партнера, спонсора, предложил новые форматы и т.д.). Друзья получат с этой недели 10% скидки на продукты и в будущим от нас мерч + разные плюшки.', '{"tournaments_count": 10, "multiple_products": true}'),
(4, 'GoPadel Aksakal', 15, 'Активно участвует с нами более 6 месяцев, посетил суммарно больше 20 турниров, помогает комьюнити, приглашает друзей и и т.д. Аксакалы получают 15% скидки на продукты и в будущем от нас мерч + разные плюшки.', '{"months": 6, "tournaments_count": 20}'),
(5, 'Ambassador', 20, 'Те, кто активно про нас рассказывают во вне, привлекают больше всех участников, помогают поддержать и развить имя и имидж комьюнити. Амбассадоры получают 20% скидки на продукты и в будущем от нас мерч + разные плюшки.', '{"ambassador": true}'),
(6, 'Меценат GoPadel', 10, 'Меценаты сообщества, которые вносят значительный вклад в развитие комьюнити. Меценаты получают 10% скидки на продукты.', NULL),
(7, 'Партнер', 30, 'Партнеры получают 30% скидки на продукты и в будущем от нас мерч + разные плюшки.', NULL);


-- Insert default club (from migration add_clubs_and_update_tournaments.py)
INSERT INTO clubs (name, address) VALUES ('Временный клуб', 'Адрес будет обновлен');

-- Reset sequences to ensure proper auto-increment behavior
SELECT setval('loyalties_id_seq', (SELECT MAX(id) FROM loyalties));
SELECT setval('waitlists_id_seq', 1, false); 