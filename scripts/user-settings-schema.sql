-- Create user_settings table for storing notification and privacy preferences
CREATE TABLE IF NOT EXISTS user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    
    -- Notification settings
    email_tournaments BOOLEAN DEFAULT TRUE,
    email_matches BOOLEAN DEFAULT TRUE,
    email_marketing BOOLEAN DEFAULT FALSE,
    sms_tournaments BOOLEAN DEFAULT TRUE,
    sms_matches BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT FALSE,
    
    -- Preference settings
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    theme VARCHAR(20) DEFAULT 'system',
    currency VARCHAR(10) DEFAULT 'KES',
    
    -- Privacy settings
    profile_visibility ENUM('public', 'friends', 'private') DEFAULT 'public',
    show_stats BOOLEAN DEFAULT TRUE,
    show_earnings BOOLEAN DEFAULT FALSE,
    allow_friend_requests BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_settings (user_id)
);

-- Create password_reset_tokens table for secure password resets
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);

-- Insert default settings for existing users
INSERT IGNORE INTO user_settings (user_id)
SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM user_settings);
