-- Neon PostgreSQL Schema for PES Tournament Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gamertag VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('player', 'organizer', 'admin')),
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tournaments table
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_id INTEGER NOT NULL REFERENCES users(id),
    format VARCHAR(50) NOT NULL CHECK (format IN ('knockout', 'double-elimination', 'round-robin', 'swiss')),
    max_players INTEGER NOT NULL,
    entry_fee DECIMAL(10,2) NOT NULL,
    prize_pool DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'registration', 'ongoing', 'completed', 'cancelled')),
    registration_deadline TIMESTAMP NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    rules TEXT,
    require_screenshots BOOLEAN DEFAULT TRUE,
    allow_disputes BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournament registrations
CREATE TABLE tournament_registrations (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
    player_id INTEGER NOT NULL REFERENCES users(id),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_reference VARCHAR(255),
    mpesa_transaction_id VARCHAR(255),
    UNIQUE(tournament_id, player_id)
);

-- Matches table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
    player1_id INTEGER NOT NULL REFERENCES users(id),
    player2_id INTEGER NOT NULL REFERENCES users(id),
    round_number INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    scheduled_time TIMESTAMP,
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    winner_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'disputed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match results submissions
CREATE TABLE match_results (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id),
    submitted_by INTEGER NOT NULL REFERENCES users(id),
    player1_score INTEGER NOT NULL,
    player2_score INTEGER NOT NULL,
    screenshot_url VARCHAR(500),
    notes TEXT,
    ocr_extracted_data JSONB,
    submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_by INTEGER REFERENCES users(id),
    confirmed_at TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    tournament_id INTEGER REFERENCES tournaments(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('entry_fee', 'prize_payout', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    mpesa_transaction_id VARCHAR(255),
    mpesa_receipt_number VARCHAR(255),
    phone_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player statistics
CREATE TABLE player_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES users(id),
    tournament_id INTEGER REFERENCES tournaments(id),
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    matches_lost INTEGER DEFAULT 0,
    matches_drawn INTEGER DEFAULT 0,
    goals_scored INTEGER DEFAULT 0,
    goals_conceded INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    ranking_points INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, tournament_id)
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_players ON matches(player1_id, player2_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Insert sample data
INSERT INTO users (email, password_hash, name, phone, gamertag, role) VALUES
('admin@peskeny.com', '$2b$10$example_hash', 'Admin User', '254712345678', 'AdminPES', 'admin'),
('organizer@peskeny.com', '$2b$10$example_hash', 'Tournament Organizer', '254723456789', 'OrganizerPro', 'organizer'),
('player1@peskeny.com', '$2b$10$example_hash', 'John Doe', '254734567890', 'JohnPES', 'player'),
('player2@peskeny.com', '$2b$10$example_hash', 'Jane Smith', '254745678901', 'JanePES', 'player');
