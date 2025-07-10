-- Expand domain models
-- Add CreatedAt and UpdatedAt to all tables
ALTER TABLE users ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE courts ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE courts ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE tournaments ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE tournaments ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE registrations ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE registrations ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

ALTER TABLE payments ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE payments ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Create function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for courts table 
CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for tournaments table
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for registrations table
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for payments table
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create data column for tournaments
ALTER TABLE tournaments ADD COLUMN data JSONB; -- to contain results of the tournament

