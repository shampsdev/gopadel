CREATE TABLE IF NOT EXISTS "user" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    telegram_username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "cat" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_telegram_id ON "user"(telegram_id);
CREATE INDEX idx_cat_owner_id ON cat(owner_id);
CREATE INDEX idx_cat_name ON cat(name);
