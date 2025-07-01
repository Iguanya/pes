-- PES Tournament Platform Database Schema

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gamertag VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('player', 'organizer', 'admin') DEFAULT 'player',
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tournaments table
CREATE TABLE tournaments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_id INT NOT NULL,
    format ENUM('knockout', 'double-elimination', 'round-robin', 'swiss') NOT NULL,
    max_players INT NOT NULL,
    entry_fee DECIMAL(10,2) NOT NULL,
    prize_pool DECIMAL(10,2) DEFAULT 0,
    status ENUM('draft', 'registration', 'ongoing', 'completed', 'cancelled') DEFAULT 'draft',
    registration_deadline DATETIME NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    rules TEXT,
    require_screenshots BOOLEAN DEFAULT TRUE,
    allow_disputes BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id)
);

-- Tournament registrations
CREATE TABLE tournament_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    player_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_reference VARCHAR(255),
    mpesa_transaction_id VARCHAR(255),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (player_id) REFERENCES users(id),
    UNIQUE KEY unique_registration (tournament_id, player_id)
);

-- Matches table
CREATE TABLE matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    player1_id INT NOT NULL,
    player2_id INT NOT NULL,
    round_number INT NOT NULL,
    match_number INT NOT NULL,
    scheduled_time DATETIME,
    player1_score INT DEFAULT 0,
    player2_score INT DEFAULT 0,
    winner_id INT,
    status ENUM('scheduled', 'ongoing', 'completed', 'disputed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (player1_id) REFERENCES users(id),
    FOREIGN KEY (player2_id) REFERENCES users(id),
    FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- Match results submissions
CREATE TABLE match_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT NOT NULL,
    submitted_by INT NOT NULL,
    player1_score INT NOT NULL,
    player2_score INT NOT NULL,
    screenshot_url VARCHAR(500),
    notes TEXT,
    ocr_extracted_data JSON,
    submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_by INT,
    confirmed_at TIMESTAMP NULL,
    FOREIGN KEY (match_id) REFERENCES matches(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (confirmed_by) REFERENCES users(id)
);

-- Disputes table
CREATE TABLE disputes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    match_id INT NOT NULL,
    raised_by INT NOT NULL,
    reason TEXT NOT NULL,
    evidence_urls JSON,
    status ENUM('open', 'under_review', 'resolved', 'rejected') DEFAULT 'open',
    admin_notes TEXT,
    resolved_by INT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id),
    FOREIGN KEY (raised_by) REFERENCES users(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);

-- Payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tournament_id INT,
    type ENUM('entry_fee', 'prize_payout', 'refund') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    mpesa_transaction_id VARCHAR(255),
    mpesa_receipt_number VARCHAR(255),
    phone_number VARCHAR(20),
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

-- Player statistics
CREATE TABLE player_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT NOT NULL,
    tournament_id INT,
    matches_played INT DEFAULT 0,
    matches_won INT DEFAULT 0,
    matches_lost INT DEFAULT 0,
    matches_drawn INT DEFAULT 0,
    goals_scored INT DEFAULT 0,
    goals_conceded INT DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    ranking_points INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES users(id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    UNIQUE KEY unique_player_tournament (player_id, tournament_id)
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('match_scheduled', 'result_submitted', 'payment_received', 'tournament_update', 'dispute_raised') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Leaderboards table
CREATE TABLE leaderboards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT NOT NULL,
    period ENUM('weekly', 'monthly', 'all_time') NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    ranking_points INT DEFAULT 0,
    tournaments_won INT DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    matches_played INT DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES users(id),
    UNIQUE KEY unique_player_period (player_id, period, period_start)
);

-- Referrals table
CREATE TABLE referrals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    referrer_id INT NOT NULL,
    referred_id INT NOT NULL,
    referral_code VARCHAR(50) NOT NULL,
    bonus_amount DECIMAL(10,2) DEFAULT 0,
    status ENUM('pending', 'completed', 'expired') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (referrer_id) REFERENCES users(id),
    FOREIGN KEY (referred_id) REFERENCES users(id)
);

-- Indexes for better performance
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_players ON matches(player1_id, player2_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_leaderboards_period ON leaderboards(period, period_start);
