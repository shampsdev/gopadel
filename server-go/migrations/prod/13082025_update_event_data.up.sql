-- Миграция для обновления поля data в таблице event
-- Заполнение данных из старых tournament_type в новое поле data

-- Обновление для турнира e38d8d73-ff81-4cf4-848d-f7e3b5532a17
UPDATE "event"
SET data = '{
    "result": {
        "leaderboard": [
            {
                "place": 1,
                "userId": "d4b1f354-2daa-4ccb-b304-8ac73e12bad4"
            }
        ]
    },
    "tournament": {
        "type": "Американо"
    }
}'::jsonb
WHERE id = 'e38d8d73-ff81-4cf4-848d-f7e3b5532a17';

-- Обновление для турнира ba2da947-9c92-43b7-af4c-7a4de71edda4
UPDATE "event"
SET data = '{
    "result": {
        "leaderboard": [
            {
                "place": 1,
                "userId": "fd85bdb0-d7ba-4bce-aee0-3e7b845b4e2c"
            }
        ]
    },
    "tournament": {
        "type": "americano"
    }
}'::jsonb
WHERE id = 'ba2da947-9c92-43b7-af4c-7a4de71edda4';

-- Обновление для турнира f8d7f462-1271-4e30-92c5-4b3e131ab2c1
UPDATE "event"
SET data = '{
    "result": {
        "leaderboard": [
            {
                "place": 1,
                "userId": "82d088b8-d789-4693-a3d4-f416da42ad7f"
            }
        ]
    },
    "tournament": {
        "type": "Тренировка/обучение + игра"
    }
}'::jsonb
WHERE id = 'f8d7f462-1271-4e30-92c5-4b3e131ab2c1';

-- Обновление для турнира 7089d8d7-6efa-46be-9544-436db21b8aa8
UPDATE "event"
SET data = '{
    "result": {
        "leaderboard": [
            {
                "place": 1,
                "userId": "faaf98ad-b68c-4350-b1b0-a452b9deca97"
            }
        ]
    },
    "tournament": {
        "type": "mexicano"
    }
}'::jsonb
WHERE id = '7089d8d7-6efa-46be-9544-436db21b8aa8';

-- Обновление для турнира af0a284e-259e-4f89-a9de-15b7d17067a0
UPDATE "event"
SET data = '{
    "result": {
        "leaderboard": [
            {
                "place": 1,
                "userId": "70918748-aed4-4697-bf9d-62fb3211d67a"
            },
            {
                "place": 2,
                "userId": "a64d81cd-2cc2-48a0-ac9a-fe32407d1365"
            }
        ]
    },
    "tournament": {
        "type": "americano"
    }
}'::jsonb
WHERE id = 'af0a284e-259e-4f89-a9de-15b7d17067a0';

-- Обновление для турнира 768b31fc-4a8c-4c70-ab1e-2a3c46f9cf3a
UPDATE "event"
SET data = '{
    "result": {
        "leaderboard": [
            {
                "place": 1,
                "userId": "d4b1f354-2daa-4ccb-b304-8ac73e12bad4"
            }
        ]
    },
    "tournament": {
        "type": "Американо"
    }
}'::jsonb
WHERE id = '768b31fc-4a8c-4c70-ab1e-2a3c46f9cf3a';

-- Обновление для турнира 9bf57664-d7b1-46a5-a783-420df148bf7e
UPDATE "event"
SET data = '{
    "result": {
        "leaderboard": [
            {
                "place": 2,
                "userId": "2455ba80-2c99-4750-87f6-c60c0d2899fb"
            }
        ]
    },
    "tournament": {
        "type": "Round Robin"
    }
}'::jsonb
WHERE id = '9bf57664-d7b1-46a5-a783-420df148bf7e';

-- Обновление типа события для всех остальных записей на основе tournament_type
UPDATE "event" e
SET data = jsonb_build_object(
    'tournament', jsonb_build_object(
        'type', t.tournament_type
    )
)
FROM (
    SELECT id, tournament_type 
    FROM (VALUES
        ('0f236533-566f-4360-bb3a-34ef783fb8e1', 'Тренировка'),
        ('62957fa6-29d7-43bc-a4cd-b35d930a394b', 'Американо'),
        ('06ce4a78-0ec6-4641-8aa4-f0d7b3b2dda4', 'Американо'),
        ('481a5cf0-87c1-4b96-951f-5f233f940b49', 'americano'),
        ('05ea7836-1ef8-4019-9dc3-92e835001a25', 'Король корта'),
        ('b750ef65-0e23-4538-aef1-08542fac8516', 'Americano'),
        ('3395378a-b27f-49dc-8199-781b43e5df58', 'Американо'),
        ('66708e4c-043f-4e87-9d37-9eec6dc8086e', 'Американо'),
        ('1dac2108-4e9b-4ed1-8566-dda7623aaf0b', 'Американо'),
        ('3dfa44dd-e03d-42f0-94de-a3c8859b2b85', 'Американо'),
        ('430a1389-b004-424a-ab4d-a0a3f31624a3', 'Король корта'),
        ('1d5bbf4b-edd2-4efb-916c-a5304f649c0a', 'Американо'),
        ('f1bcfd5a-49f9-4d6e-aef4-404962b14fe2', 'Американо'),
        ('abc3021e-a5ef-47ea-a708-7042b63a3ebe', 'Американо'),
        ('8db38a42-9655-4562-b386-e4332adbd293', 'Американо'),
        ('ed2c7512-8e02-4a3e-a758-27c519a4812a', 'Американо'),
        ('b44d3b56-8668-47f1-83e6-f05a5197c22d', 'Американо'),
        ('2d8d938c-adb0-4d69-8c7e-dcbbfa8f9558', 'Mixed Americano'),
        ('7f1540aa-9024-4d61-bf7e-9553c5047524', 'Американо'),
        ('22c26766-4521-4615-9467-5c9086f70da6', 'Американо'),
        ('8123110c-2f3c-495f-9e11-16e57fde4be3', 'Американо'),
        ('13cf8747-f44d-431a-803f-3e26c8c2fc3b', 'Американо'),
        ('c8820032-6255-469c-a892-2bf40db72e01', 'Американо'),
        ('5070c5a4-84d7-4273-937f-5c950e5f8897', 'Тренировка'),
        ('7cdcb5f0-b78a-4999-9fbf-d26795bc005c', 'Тренировка'),
        ('bf6933f7-0ab6-429e-a4cd-771ad166459f', 'Группы + плей-офф'),
        ('ed0f49dc-b5c3-4b29-aaf1-d75bfe44ac28', 'Американо'),
        ('580ce0c3-826f-4c12-b396-c8dedc8c053f', 'Вечеринка!'),
        ('9c2d4696-2682-4369-8fa1-9a4faf436b77', 'King of the court'),
        ('cc3b0fad-325b-4ab9-8439-0e8c126932e9', 'tournament'),
        ('a77d502e-9f38-46f5-bf38-97d4a73cad64', 'americano'),
        ('48f07ff4-bff5-4554-a6c2-e53e60e4f364', 'Американо'),
        ('8a68e853-7c63-4d3d-be0d-106fccd16103', 'tournament')
    ) AS t(id, tournament_type)
) t
WHERE e.id = t.id
AND e.data IS NULL;

-- Обновление типа события для всех записей, где data всё ещё NULL
UPDATE "event"
SET data = jsonb_build_object(
    'tournament', jsonb_build_object(
        'type', 'Американо'
    )
)
WHERE data IS NULL AND type = 'tournament';

-- Обновление типа события для игр, где data всё ещё NULL
UPDATE "event"
SET data = jsonb_build_object(
    'game', jsonb_build_object(
        'type', 'Американо'
    )
)
WHERE data IS NULL AND type = 'game';

-- Добавление комментария для будущих разработчиков
COMMENT ON COLUMN "event"."data" IS 'JSONB поле для хранения результатов турниров, типов игр и других дополнительных данных'; 