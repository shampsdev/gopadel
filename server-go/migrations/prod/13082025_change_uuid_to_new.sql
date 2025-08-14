BEGIN;

-- Миграция для преобразования ID событий из UUID в формат с префиксом
-- Новый формат: tour-XXXXXXXXXX, game-XXXXXXXXXX, train-XXXXXXXXXX

-- Создаем временную таблицу для хранения соответствия старых и новых ID
CREATE TEMPORARY TABLE event_id_mapping (
    old_id VARCHAR(255),
    new_id VARCHAR(255)
);

-- Заполняем таблицу соответствия для турниров из CSV
INSERT INTO event_id_mapping (old_id, new_id) VALUES
('0f236533-566f-4360-bb3a-34ef783fb8e1', 'train-A7B9C2D4E6'),
('62957fa6-29d7-43bc-a4cd-b35d930a394b', 'tour-F8G6H4J2K1'),
('06ce4a78-0ec6-4641-8aa4-f0d7b3b2dda4', 'tour-L3M5N7P9Q0'),
('481a5cf0-87c1-4b96-951f-5f233f940b49', 'tour-R1S3T5U7V9'),
('05ea7836-1ef8-4019-9dc3-92e835001a25', 'tour-W2X4Y6Z8A0'),
('b750ef65-0e23-4538-aef1-08542fac8516', 'tour-B1C3D5E7F9'),
('3395378a-b27f-49dc-8199-781b43e5df58', 'tour-G2H4J6K8L0'),
('66708e4c-043f-4e87-9d37-9eec6dc8086e', 'tour-M1N3P5Q7R9'),
('1dac2108-4e9b-4ed1-8566-dda7623aaf0b', 'tour-S2T4U6V8W0'),
('3dfa44dd-e03d-42f0-94de-a3c8859b2b85', 'tour-X1Y3Z5A7B9'),
('430a1389-b004-424a-ab4d-a0a3f31624a3', 'tour-C2D4E6F8G0'),
('1d5bbf4b-edd2-4efb-916c-a5304f649c0a', 'tour-H1J3K5L7M9'),
('f1bcfd5a-49f9-4d6e-aef4-404962b14fe2', 'tour-N2P4Q6R8S0'),
('abc3021e-a5ef-47ea-a708-7042b63a3ebe', 'tour-T1U3V5W7X9'),
('8db38a42-9655-4562-b386-e4332adbd293', 'tour-Y2Z4A6B8C0'),
('ed2c7512-8e02-4a3e-a758-27c519a4812a', 'tour-D1E3F5G7H9'),
('b44d3b56-8668-47f1-83e6-f05a5197c22d', 'tour-J2K4L6M8N0'),
('2d8d938c-adb0-4d69-8c7e-dcbbfa8f9558', 'tour-P1Q3R5S7T9'),
('7f1540aa-9024-4d61-bf7e-9553c5047524', 'tour-U2V4W6X8Y0'),
('22c26766-4521-4615-9467-5c9086f70da6', 'tour-Z1A3B5C7D9'),
('8123110c-2f3c-495f-9e11-16e57fde4be3', 'tour-E2F4G6H8J0'),
('13cf8747-f44d-431a-803f-3e26c8c2fc3b', 'tour-K1L3M5N7P9'),
('c8820032-6255-469c-a892-2bf40db72e01', 'tour-Q2R4S6T8U0'),
('5070c5a4-84d7-4273-937f-5c950e5f8897', 'train-V1W3X5Y7Z9'),
('7cdcb5f0-b78a-4999-9fbf-d26795bc005c', 'train-A2B4C6D8E0'),
('e38d8d73-ff81-4cf4-848d-f7e3b5532a17', 'tour-F1G3H5J7K9'),
('bf6933f7-0ab6-429e-a4cd-771ad166459f', 'tour-L2M4N6P8Q0'),
('ed0f49dc-b5c3-4b29-aaf1-d75bfe44ac28', 'tour-R2S4T6U8V0'),
('ba2da947-9c92-43b7-af4c-7a4de71edda4', 'tour-W1X3Y5Z7A9'),
('580ce0c3-826f-4c12-b396-c8dedc8c053f', 'tour-B2C4D6E8F0'),
('9c2d4696-2682-4369-8fa1-9a4faf436b77', 'tour-G1H3J5K7L9'),
('f8d7f462-1271-4e30-92c5-4b3e131ab2c1', 'train-M1N3P5Q7R9'),
('cc3b0fad-325b-4ab9-8439-0e8c126932e9', 'tour-S1T3U5V7W9'),
('7089d8d7-6efa-46be-9544-436db21b8aa8', 'tour-X2Y4Z6A8B0'),
('a77d502e-9f38-46f5-bf38-97d4a73cad64', 'tour-C1D3E5F7G9'),
('48f07ff4-bff5-4554-a6c2-e53e60e4f364', 'tour-H2J4K6L8M0'),
('8a68e853-7c63-4d3d-be0d-106fccd16103', 'tour-N1P3Q5R7S9'),
('af0a284e-259e-4f89-a9de-15b7d17067a0', 'tour-T2U4V6W8X0'),
('768b31fc-4a8c-4c70-ab1e-2a3c46f9cf3a', 'tour-Y1Z3A5B7C9'),
('9bf57664-d7b1-46a5-a783-420df148bf7e', 'tour-D2E4F6G8H0');

-- Создаем временную таблицу для хранения данных из registrations
CREATE TEMPORARY TABLE temp_registrations AS 
SELECT user_id, event_id, status, created_at, updated_at 
FROM registrations;

-- Создаем временную таблицу для хранения данных из payments
CREATE TEMPORARY TABLE temp_payments AS 
SELECT id, user_id, event_id, payment_id, amount, status, payment_link, confirmation_token, created_at, updated_at 
FROM payments;

-- Создаем временную таблицу для хранения данных из waitlists
CREATE TEMPORARY TABLE temp_waitlists AS 
SELECT id, user_id, event_id, date 
FROM waitlists;

-- Временно удаляем внешние ключи
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_event_id_fkey;
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_new_event_id_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_user_event;
ALTER TABLE waitlists DROP CONSTRAINT IF EXISTS fk_waitlists_event_id;

-- Обновляем ID в таблице event, используя соответствие из таблицы mapping
UPDATE "event" e
SET id = m.new_id
FROM event_id_mapping m
WHERE e.id = m.old_id;

-- Обновляем внешние ключи в таблице registrations
UPDATE registrations r
SET event_id = m.new_id
FROM event_id_mapping m
WHERE r.event_id = m.old_id;

-- Обновляем внешние ключи в таблице payments
UPDATE payments p
SET event_id = m.new_id
FROM event_id_mapping m
WHERE p.event_id = m.old_id;

-- Обновляем внешние ключи в таблице waitlists
UPDATE waitlists w
SET event_id = m.new_id
FROM event_id_mapping m
WHERE w.event_id = m.old_id;

-- Восстанавливаем внешние ключи
ALTER TABLE registrations ADD CONSTRAINT registrations_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES "event"(id);
ALTER TABLE payments ADD CONSTRAINT fk_payments_user_event 
    FOREIGN KEY (user_id, event_id) REFERENCES registrations(user_id, event_id);
ALTER TABLE waitlists ADD CONSTRAINT fk_waitlists_event_id 
    FOREIGN KEY (event_id) REFERENCES "event"(id);

-- Удаляем временные таблицы
DROP TABLE event_id_mapping;
DROP TABLE temp_registrations;
DROP TABLE temp_payments;
DROP TABLE temp_waitlists;

COMMIT;