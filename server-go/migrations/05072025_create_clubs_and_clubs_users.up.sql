-- Create clubs table (communities)
CREATE TABLE clubs (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create clubs_users table (many-to-many relationship)
CREATE TABLE clubs_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id VARCHAR(255) NOT NULL REFERENCES clubs(id),
    user_id UUID NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(club_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_clubs_users_club_id ON clubs_users(club_id);
CREATE INDEX idx_clubs_users_user_id ON clubs_users(user_id);

-- Insert default global community
INSERT INTO clubs (id, name, description) VALUES 
    ('global', 'Глобальное сообщество', 'Основное сообщество для всех пользователей GoPadel');

-- Add all existing users to the global club
INSERT INTO clubs_users (club_id, user_id)
SELECT 'global', id FROM users; 