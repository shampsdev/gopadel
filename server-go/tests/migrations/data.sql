-- Court with id for tests
INSERT INTO "courts" ("id", "name", "address", "created_at", "updated_at") VALUES
('4ea67445-b73a-4b5b-b200-cc7f98b7f102',	'Test court',	'Test address',	'2025-07-09 18:27:51.319236',	'2025-07-09 18:27:51.320409');

-- Users for test (mine)
INSERT INTO "users" ("id", "telegram_id", "telegram_username", "first_name", "last_name", "avatar", "rank", "city", "birth_date", "loyalty_id", "is_registered", "bio", "playing_position", "padel_profiles", "created_at", "updated_at") VALUES
('fbacb352-b903-4ab1-be91-e2eff35f9580',	432066121,	'keine_salz',	'Sleep',	'Sugar',	'sadads',	4,	'asdasd',	'2004-01-12',	5,	't',	'asdasd',	'left',	'google.com',	'2025-07-09 18:27:51.316299',	'2025-07-09 18:27:51.317949'),
('f7ae0836-03a8-42ea-be2f-b9010b8ee012',	7167114456,	'schlafzucker',	'',	'',	NULL,	0,	'',	NULL,	1,	't',	'',	NULL,	NULL,	'2025-07-09 18:27:51.316299',	'2025-07-18 17:48:08.233056');

-- Admin user (mine)
INSERT INTO "admin_users" ("id", "username", "password_hash", "is_superuser", "is_active", "first_name", "last_name", "user_id") VALUES
('550e8400-e29b-41d4-a716-446655440000',	'test',	'$2a$10$gBlVW55yyHQtTqA4fU9Qiu9tmojQxib4aXg6tV4krzJ1K4v4OU7SC',	't',	't',	'Super',	'Admin',	'fbacb352-b903-4ab1-be91-e2eff35f9580');
