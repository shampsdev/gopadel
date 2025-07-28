-- Migration: Add many registrations and payments for testing
-- +goose Up

-- Добавляем много регистраций для турниров
INSERT INTO "registrations" ("user_id", "event_id", "status", "created_at", "updated_at") VALUES
-- Турнир "Мастерс Зимний вызов" (7bf2ec94-54f5-4ec5-9713-8e68520e99ff)
('fbacb352-b903-4ab1-be91-e2eff35f9580', '7bf2ec94-54f5-4ec5-9713-8e68520e99ff', 'CONFIRMED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('f7ae0836-03a8-42ea-be2f-b9010b8ee012', '7bf2ec94-54f5-4ec5-9713-8e68520e99ff', 'CONFIRMED', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('7a2c971d-a3a8-41fe-80bf-4b5101e44b33', '7bf2ec94-54f5-4ec5-9713-8e68520e99ff', 'PENDING', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('14866866-3b53-48a5-898b-b1e39bc29bae', '7bf2ec94-54f5-4ec5-9713-8e68520e99ff', 'CANCELLED_BEFORE_PAYMENT', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('d2680603-113f-4487-9f17-c6efcf311a91', '7bf2ec94-54f5-4ec5-9713-8e68520e99ff', 'REFUNDED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Турнир "Открытый турнир Январский старт" (4db6323f-9042-4295-8e72-0d8158ad2093)
('1d6bb3d4-1500-4b9f-9344-fb5bdc7fb7e1', '4db6323f-9042-4295-8e72-0d8158ad2093', 'CONFIRMED', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('f22f076c-135c-407b-a7d1-3d9f0aefc5fd', '4db6323f-9042-4295-8e72-0d8158ad2093', 'CONFIRMED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('b8d8c61f-999b-462c-a0d9-7d2837b565e4', '4db6323f-9042-4295-8e72-0d8158ad2093', 'PENDING', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('dfa0e28a-73ca-4820-8a2b-cf82ba74ac12', '4db6323f-9042-4295-8e72-0d8158ad2093', 'CONFIRMED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('e1ce7266-c8f8-4921-ac8a-7a2b897b7a25', '4db6323f-9042-4295-8e72-0d8158ad2093', 'CANCELLED_BEFORE_PAYMENT', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('827c033f-f377-4804-a1f1-90b8a35843a0', '4db6323f-9042-4295-8e72-0d8158ad2093', 'PENDING', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Турнир "Профессиональный турнир Элита" (838231d1-6bb1-42d9-968c-01d2146d34cc)
('d9280db2-b915-4bb0-8be3-c27bdea00c78', '838231d1-6bb1-42d9-968c-01d2146d34cc', 'CONFIRMED', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('603ab7bc-9ad4-4c1b-9081-070d19c37610', '838231d1-6bb1-42d9-968c-01d2146d34cc', 'CONFIRMED', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('0c393d6d-f418-4dcb-9c1e-ffd6edd66193', '838231d1-6bb1-42d9-968c-01d2146d34cc', 'PENDING', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('484da795-4baf-4c84-a030-1c1471c8229f', '838231d1-6bb1-42d9-968c-01d2146d34cc', 'REFUNDED', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

-- Турнир "Женский турнир Леди Падель" (da663cf7-6846-4bd1-8bd5-ffdc14a55f0b)
('508bb25a-49c4-4d7f-b550-a80e6082f8b0', 'da663cf7-6846-4bd1-8bd5-ffdc14a55f0b', 'CONFIRMED', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('5a6c2355-0535-4ecb-9ac7-7edf712539b6', 'da663cf7-6846-4bd1-8bd5-ffdc14a55f0b', 'CONFIRMED', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('9420499b-5a82-4471-b256-e3a86a70a1ab', 'da663cf7-6846-4bd1-8bd5-ffdc14a55f0b', 'PENDING', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('282b8fd6-761b-44c2-9035-88115a0b9732', 'da663cf7-6846-4bd1-8bd5-ffdc14a55f0b', 'CONFIRMED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('d15d8cde-0066-4c84-960a-5dd98ef7a0f4', 'da663cf7-6846-4bd1-8bd5-ffdc14a55f0b', 'CANCELLED_BEFORE_PAYMENT', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('a0abac09-a37c-4f09-98b8-bcc31c03c357', 'da663cf7-6846-4bd1-8bd5-ffdc14a55f0b', 'REFUNDED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Турнир "Любительский турнир Выходной" (99260b8a-1362-4e83-ae45-4db70d2418b6)
('9204882d-bfde-404f-a720-81f3e4e26ba3', '99260b8a-1362-4e83-ae45-4db70d2418b6', 'CONFIRMED', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
('94ef89b4-6e8c-4a27-a537-e50ad7488bdf', '99260b8a-1362-4e83-ae45-4db70d2418b6', 'CONFIRMED', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('5970b987-f205-4eb8-a488-f2ed308b2815', '99260b8a-1362-4e83-ae45-4db70d2418b6', 'PENDING', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('11bb370b-67ec-4872-8ee4-620f67333087', '99260b8a-1362-4e83-ae45-4db70d2418b6', 'CONFIRMED', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('ccac0b51-fc2d-431d-af05-59805d2274f2', '99260b8a-1362-4e83-ae45-4db70d2418b6', 'CONFIRMED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('11d11520-04ad-496a-814f-59429d7b6ccd', '99260b8a-1362-4e83-ae45-4db70d2418b6', 'CANCELLED_BEFORE_PAYMENT', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

-- Турнир "Ночной" (41edb3ad-33ba-4f13-9e86-14344aeee0be)
('e02fc14e-a4c8-4a8c-9967-219da7828f8f', '41edb3ad-33ba-4f13-9e86-14344aeee0be', 'CONFIRMED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('d89f0e5a-4e7d-4ce4-abe6-ecd138e8721e', '41edb3ad-33ba-4f13-9e86-14344aeee0be', 'PENDING', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
('c7940d85-589a-414d-b686-5bed11be0398', '41edb3ad-33ba-4f13-9e86-14344aeee0be', 'CONFIRMED', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('154bdc4a-8861-4100-8ac1-7ef3d3b8ae90', '41edb3ad-33ba-4f13-9e86-14344aeee0be', 'REFUNDED', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days');

-- Добавляем платежи для подтвержденных регистраций
INSERT INTO "payments" ("id", "payment_id", "date", "amount", "status", "payment_link", "confirmation_token", "created_at", "updated_at", "user_id", "event_id") VALUES
-- Платежи для турнира "Мастерс Зимний вызов"
(gen_random_uuid(), 'yoo_payment_001', NOW() - INTERVAL '5 days', 3000, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=001', 'conf_token_001', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', 'fbacb352-b903-4ab1-be91-e2eff35f9580', '7bf2ec94-54f5-4ec5-9713-8e68520e99ff'),
(gen_random_uuid(), 'yoo_payment_002', NOW() - INTERVAL '4 days', 3000, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=002', 'conf_token_002', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'f7ae0836-03a8-42ea-be2f-b9010b8ee012', '7bf2ec94-54f5-4ec5-9713-8e68520e99ff'),
(gen_random_uuid(), 'yoo_payment_003', NOW() - INTERVAL '3 days', 3000, 'pending', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=003', 'conf_token_003', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', '7a2c971d-a3a8-41fe-80bf-4b5101e44b33', '7bf2ec94-54f5-4ec5-9713-8e68520e99ff'),
(gen_random_uuid(), 'yoo_payment_004', NOW() - INTERVAL '1 day', 3000, 'canceled', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=004', 'conf_token_004', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'd2680603-113f-4487-9f17-c6efcf311a91', '7bf2ec94-54f5-4ec5-9713-8e68520e99ff'),

-- Платежи для турнира "Открытый турнир Январский старт"
(gen_random_uuid(), 'yoo_payment_005', NOW() - INTERVAL '6 days', 1500, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=005', 'conf_token_005', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', '1d6bb3d4-1500-4b9f-9344-fb5bdc7fb7e1', '4db6323f-9042-4295-8e72-0d8158ad2093'),
(gen_random_uuid(), 'yoo_payment_006', NOW() - INTERVAL '5 days', 1500, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=006', 'conf_token_006', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', 'f22f076c-135c-407b-a7d1-3d9f0aefc5fd', '4db6323f-9042-4295-8e72-0d8158ad2093'),
(gen_random_uuid(), 'yoo_payment_007', NOW() - INTERVAL '4 days', 1500, 'waiting_for_capture', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=007', 'conf_token_007', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'b8d8c61f-999b-462c-a0d9-7d2837b565e4', '4db6323f-9042-4295-8e72-0d8158ad2093'),
(gen_random_uuid(), 'yoo_payment_008', NOW() - INTERVAL '3 days', 1500, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=008', 'conf_token_008', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'dfa0e28a-73ca-4820-8a2b-cf82ba74ac12', '4db6323f-9042-4295-8e72-0d8158ad2093'),
(gen_random_uuid(), 'yoo_payment_009', NOW() - INTERVAL '1 day', 1500, 'pending', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=009', 'conf_token_009', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', '827c033f-f377-4804-a1f1-90b8a35843a0', '4db6323f-9042-4295-8e72-0d8158ad2093'),

-- Платежи для турнира "Профессиональный турнир Элита"
(gen_random_uuid(), 'yoo_payment_010', NOW() - INTERVAL '7 days', 5000, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=010', 'conf_token_010', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', 'd9280db2-b915-4bb0-8be3-c27bdea00c78', '838231d1-6bb1-42d9-968c-01d2146d34cc'),
(gen_random_uuid(), 'yoo_payment_011', NOW() - INTERVAL '6 days', 5000, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=011', 'conf_token_011', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', '603ab7bc-9ad4-4c1b-9081-070d19c37610', '838231d1-6bb1-42d9-968c-01d2146d34cc'),
(gen_random_uuid(), 'yoo_payment_012', NOW() - INTERVAL '5 days', 5000, 'pending', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=012', 'conf_token_012', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', '0c393d6d-f418-4dcb-9c1e-ffd6edd66193', '838231d1-6bb1-42d9-968c-01d2146d34cc'),
(gen_random_uuid(), 'yoo_payment_013', NOW() - INTERVAL '4 days', 5000, 'canceled', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=013', 'conf_token_013', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', '484da795-4baf-4c84-a030-1c1471c8229f', '838231d1-6bb1-42d9-968c-01d2146d34cc'),

-- Платежи для турнира "Женский турнир Леди Падель"
(gen_random_uuid(), 'yoo_payment_014', NOW() - INTERVAL '8 days', 2200, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=014', 'conf_token_014', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', '508bb25a-49c4-4d7f-b550-a80e6082f8b0', 'da663cf7-6846-4bd1-8bd5-ffdc14a55f0b'),
(gen_random_uuid(), 'yoo_payment_015', NOW() - INTERVAL '7 days', 2200, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=015', 'conf_token_015', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', '5a6c2355-0535-4ecb-9ac7-7edf712539b6', 'da663cf7-6846-4bd1-8bd5-ffdc14a55f0b'),
(gen_random_uuid(), 'yoo_payment_016', NOW() - INTERVAL '6 days', 2200, 'waiting_for_capture', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=016', 'conf_token_016', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', '9420499b-5a82-4471-b256-e3a86a70a1ab', 'da663cf7-6846-4bd1-8bd5-ffdc14a55f0b'),
(gen_random_uuid(), 'yoo_payment_017', NOW() - INTERVAL '5 days', 2200, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=017', 'conf_token_017', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', '282b8fd6-761b-44c2-9035-88115a0b9732', 'da663cf7-6846-4bd1-8bd5-ffdc14a55f0b'),
(gen_random_uuid(), 'yoo_payment_018', NOW() - INTERVAL '3 days', 2200, 'canceled', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=018', 'conf_token_018', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'a0abac09-a37c-4f09-98b8-bcc31c03c357', 'da663cf7-6846-4bd1-8bd5-ffdc14a55f0b'),

-- Платежи для турнира "Любительский турнир Выходной"
(gen_random_uuid(), 'yoo_payment_019', NOW() - INTERVAL '9 days', 1000, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=019', 'conf_token_019', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', '9204882d-bfde-404f-a720-81f3e4e26ba3', '99260b8a-1362-4e83-ae45-4db70d2418b6'),
(gen_random_uuid(), 'yoo_payment_020', NOW() - INTERVAL '8 days', 1000, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=020', 'conf_token_020', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', '94ef89b4-6e8c-4a27-a537-e50ad7488bdf', '99260b8a-1362-4e83-ae45-4db70d2418b6'),
(gen_random_uuid(), 'yoo_payment_021', NOW() - INTERVAL '7 days', 1000, 'pending', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=021', 'conf_token_021', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', '5970b987-f205-4eb8-a488-f2ed308b2815', '99260b8a-1362-4e83-ae45-4db70d2418b6'),
(gen_random_uuid(), 'yoo_payment_022', NOW() - INTERVAL '6 days', 1000, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=022', 'conf_token_022', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', '11bb370b-67ec-4872-8ee4-620f67333087', '99260b8a-1362-4e83-ae45-4db70d2418b6'),
(gen_random_uuid(), 'yoo_payment_023', NOW() - INTERVAL '5 days', 1000, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=023', 'conf_token_023', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', 'ccac0b51-fc2d-431d-af05-59805d2274f2', '99260b8a-1362-4e83-ae45-4db70d2418b6'),

-- Платежи для турнира "Ночной"
(gen_random_uuid(), 'yoo_payment_024', NOW() - INTERVAL '10 days', 2800, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=024', 'conf_token_024', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 'e02fc14e-a4c8-4a8c-9967-219da7828f8f', '41edb3ad-33ba-4f13-9e86-14344aeee0be'),
(gen_random_uuid(), 'yoo_payment_025', NOW() - INTERVAL '9 days', 2800, 'waiting_for_capture', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=025', 'conf_token_025', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', 'd89f0e5a-4e7d-4ce4-abe6-ecd138e8721e', '41edb3ad-33ba-4f13-9e86-14344aeee0be'),
(gen_random_uuid(), 'yoo_payment_026', NOW() - INTERVAL '8 days', 2800, 'succeeded', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=026', 'conf_token_026', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', 'c7940d85-589a-414d-b686-5bed11be0398', '41edb3ad-33ba-4f13-9e86-14344aeee0be'),
(gen_random_uuid(), 'yoo_payment_027', NOW() - INTERVAL '7 days', 2800, 'canceled', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=027', 'conf_token_027', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', '154bdc4a-8861-4100-8ac1-7ef3d3b8ae90', '41edb3ad-33ba-4f13-9e86-14344aeee0be'),

-- Дополнительные платежи для некоторых пользователей (несколько платежей на одну регистрацию)
(gen_random_uuid(), 'yoo_payment_028', NOW() - INTERVAL '5 days 2 hours', 1500, 'canceled', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=028', 'conf_token_028', NOW() - INTERVAL '5 days 2 hours', NOW() - INTERVAL '5 days 2 hours', 'fbacb352-b903-4ab1-be91-e2eff35f9580', '7bf2ec94-54f5-4ec5-9713-8e68520e99ff'),
(gen_random_uuid(), 'yoo_payment_029', NOW() - INTERVAL '6 days 1 hour', 750, 'canceled', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=029', 'conf_token_029', NOW() - INTERVAL '6 days 1 hour', NOW() - INTERVAL '6 days 1 hour', '1d6bb3d4-1500-4b9f-9344-fb5bdc7fb7e1', '4db6323f-9042-4295-8e72-0d8158ad2093'),
(gen_random_uuid(), 'yoo_payment_030', NOW() - INTERVAL '8 days 3 hours', 1100, 'canceled', 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=030', 'conf_token_030', NOW() - INTERVAL '8 days 3 hours', NOW() - INTERVAL '8 days 3 hours', '508bb25a-49c4-4d7f-b550-a80e6082f8b0', 'da663cf7-6846-4bd1-8bd5-ffdc14a55f0b');
