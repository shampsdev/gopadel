-- Add sample admin users
INSERT INTO "admin_users" ("id", "username", "password_hash", "is_superuser", "is_active", "first_name", "last_name", "user_id") VALUES
('550e8400-e29b-41d4-a716-446655440000', 'super_admin', '$2a$10$dummy.hash.for.testing.purposes.only', true, true, 'Super', 'Admin', 'b8d8c61f-999b-462c-a0d9-7d2837b565e4'),
('550e8400-e29b-41d4-a716-446655440001', 'tournament_admin', '$2a$10$dummy.hash.for.testing.purposes.only', false, true, 'Tournament', 'Admin', 'dfa0e28a-73ca-4820-8a2b-cf82ba74ac12'),
('550e8400-e29b-41d4-a716-446655440002', 'club_admin', '$2a$10$dummy.hash.for.testing.purposes.only', false, true, 'Club', 'Admin', 'e1ce7266-c8f8-4921-ac8a-7a2b897b7a25'); 