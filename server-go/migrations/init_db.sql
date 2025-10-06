-- GoPadel Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum types
CREATE TYPE registrationstatus AS ENUM ('PENDING', 'ACTIVE', 'CANCELED', 'CANCELED_BY_USER');
CREATE TYPE playingposition AS ENUM ('right', 'left', 'both');

-- Create tables

-- Loyalties table
CREATE TABLE loyalties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    discount SMALLINT NOT NULL,
    description TEXT,
    requirements JSON,
    CONSTRAINT ck_loyalties_discount CHECK (discount >= 0 AND discount <= 100)
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT NOT NULL UNIQUE,
    username VARCHAR(255) UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    second_name VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    rank FLOAT NOT NULL,
    city VARCHAR(255),
    birth_date DATE,
    loyalty_id INTEGER NOT NULL REFERENCES loyalties(id),
    is_registered BOOLEAN NOT NULL,
    bio TEXT NOT NULL DEFAULT '',
    playing_position playingposition,
    padel_profiles TEXT
);

-- Admin users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_superuser BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id)
);

-- Clubs table
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL
);

-- Tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT now(),
    end_time TIMESTAMP,
    price INTEGER NOT NULL,
    rank_min FLOAT NOT NULL,
    rank_max FLOAT NOT NULL,
    max_users INTEGER NOT NULL,
    description TEXT,
    club_id UUID NOT NULL REFERENCES clubs(id),
    tournament_type VARCHAR(100) NOT NULL,
    organizator_id UUID NOT NULL REFERENCES users(id),
    CONSTRAINT ck_tournaments_rank_min CHECK (rank_min >= 0 AND rank_min <= 7),
    CONSTRAINT ck_tournaments_rank_max CHECK (rank_max >= 0 AND rank_max <= 7),
    CONSTRAINT ck_tournaments_price CHECK (price >= 0)
);

-- Create foreign key constraint names
ALTER TABLE tournaments ADD CONSTRAINT fk_tournaments_club_id FOREIGN KEY (club_id) REFERENCES clubs(id);
ALTER TABLE tournaments ADD CONSTRAINT fk_tournaments_organizator_id_users FOREIGN KEY (organizator_id) REFERENCES users(id);

-- Registrations table
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    date TIMESTAMP NOT NULL DEFAULT now(),
    status registrationstatus NOT NULL
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT now(),
    amount INTEGER NOT NULL,
    status VARCHAR(255) NOT NULL,
    payment_link VARCHAR(255) NOT NULL,
    confirmation_token VARCHAR(255) NOT NULL DEFAULT '',
    registration_id UUID REFERENCES registrations(id),
    CONSTRAINT ck_payments_status CHECK (status IN ('pending', 'waiting_for_capture', 'succeeded', 'canceled')),
    CONSTRAINT ck_payments_amount CHECK (amount >= 0)
);

-- Add the foreign key constraint for payments.registration_id
ALTER TABLE payments ADD CONSTRAINT fk_payments_registration_id FOREIGN KEY (registration_id) REFERENCES registrations(id);

-- Waitlists table
CREATE TABLE waitlists (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    tournament_id UUID NOT NULL REFERENCES tournaments(id),
    date TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_tournament_id ON registrations(tournament_id);
CREATE INDEX idx_payments_registration_id ON payments(registration_id);
CREATE INDEX idx_waitlists_user_id ON waitlists(user_id);
CREATE INDEX idx_waitlists_tournament_id ON waitlists(tournament_id);
CREATE INDEX idx_tournaments_club_id ON tournaments(club_id);
CREATE INDEX idx_tournaments_organizator_id ON tournaments(organizator_id); 

-- Rename username column to telegram_username
ALTER TABLE users RENAME COLUMN username TO telegram_username;

-- Rename second_name column to last_name  
ALTER TABLE users RENAME COLUMN second_name TO last_name;

-- Update the index name to match the new column name
DROP INDEX IF EXISTS idx_users_username;
CREATE INDEX idx_users_telegram_username ON users(telegram_username);


ALTER TABLE users ALTER COLUMN loyalty_id SET DEFAULT 1;
ALTER TABLE users ALTER COLUMN rank SET DEFAULT 1.0;
ALTER TABLE users ALTER COLUMN is_registered SET DEFAULT false;

UPDATE users SET rank = 1.0 WHERE rank < 0 OR rank > 7;
ALTER TABLE users ADD CONSTRAINT ck_users_rank CHECK (rank >= 0 AND rank <= 7);