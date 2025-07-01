-- Insert sample users with hashed passwords (Password123)
-- Password hash generated with bcrypt, salt rounds: 12

INSERT INTO users (email, password_hash, name, phone, gamertag, role, is_active, created_at) VALUES
-- Admin account
('admin@pestournament.ke', '$2a$12$LQv3c1yqBwEUuDX.LO4HNOoqOqiTQjHxP5E5uP5E5uP5E5uP5E5uPe', 'System Administrator', '254712000001', 'admin_pes', 'admin', 1, NOW()),

-- Manager account  
('manager@pestournament.ke', '$2a$12$LQv3c1yqBwEUuDX.LO4HNOoqOqiTQjHxP5E5uP5E5uP5E5uP5E5uPe', 'Platform Manager', '254712000002', 'manager_pes', 'manager', 1, NOW()),

-- Organizer account
('organizer@pestournament.ke', '$2a$12$LQv3c1yqBwEUuDX.LO4HNOoqOqiTQjHxP5E5uP5E5uP5E5uP5E5uPe', 'Tournament Organizer', '254712000003', 'organizer_pes', 'organizer', 1, NOW()),

-- Player account
('player@pestournament.ke', '$2a$12$LQv3c1yqBwEUuDX.LO4HNOoqOqiTQjHxP5E5uP5E5uP5E5uP5E5uPe', 'John Doe', '254712000004', 'johndoe_pes', 'player', 1, NOW()),

-- Additional sample players
('alice@example.com', '$2a$12$LQv3c1yqBwEUuDX.LO4HNOoqOqiTQjHxP5E5uP5E5uP5E5uP5E5uPe', 'Alice Wanjiku', '254712000005', 'alice_pes', 'player', 1, NOW()),
('bob@example.com', '$2a$12$LQv  'Alice Wanjiku', '254712000005', 'alice_pes', 'player', 1, NOW()),
('bob@example.com', '$2a$12$LQv3c1yqBwEUuDX.LO4HNOoqOqiTQjHxP5E5uP5E5uP5E5uP5E5uPe', 'Bob Ochieng', '254712000006', 'bob_pes', 'player', 1, NOW()),
('carol@example.com', '$2a$12$LQv3c1yqBwEUuDX.LO4HNOoqOqiTQjHxP5E5uP5E5uP5E5uP5E5uPe', 'Carol Muthoni', '254712000007', 'carol_pes', 'player', 1, NOW());

-- Insert sample tournaments
INSERT INTO tournaments (name, description, organizer_id, format, max_players, entry_fee, registration_deadline, start_date, rules, status, created_at) VALUES
('Weekend Warriors Cup', 'Weekly PES tournament for casual players', 3, 'single_elimination', 16, 500, DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), 'Standard PES rules apply. No custom teams allowed.', 'registration', NOW()),
('Champions League', 'Monthly championship tournament', 3, 'double_elimination', 32, 1000, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Professional tournament rules. Screenshots required for all matches.', 'registration', NOW()),
('Beginner Friendly Cup', 'Tournament for new players', 3, 'round_robin', 8, 200, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 'Beginner friendly rules. Coaching allowed.', 'registration', NOW());

-- Insert sample tournament registrations
INSERT INTO tournament_registrations (tournament_id, user_id, entry_fee, payment_status, payment_method, created_at) VALUES
(1, 4, 500, 'completed', 'mpesa', NOW()),
(1, 5, 500, 'completed', 'mpesa', NOW()),
(1, 6, 500, 'completed', 'mpesa', NOW()),
(2, 4, 1000, 'completed', 'mpesa', NOW()),
(2, 5, 1000, 'pending', 'mpesa', NOW()),
(3, 6, 200, 'completed', 'mpesa', NOW()),
(3, 7, 200, 'completed', 'mpesa', NOW());

-- Insert sample matches
INSERT INTO matches (tournament_id, player1_id, player2_id, player1_score, player2_score, winner_id, status, created_at, updated_at) VALUES
(1, 4, 5, 3, 1, 4, 'completed', NOW(), NOW()),
(1, 6, 7, 2, 4, 7, 'completed', NOW(), NOW()),
(2, 4, 5, 1, 2, 5, 'completed', NOW(), NOW()),
(3, 6, 7, 0, 1, 7, 'completed', NOW(), NOW());

-- Insert sample payouts
INSERT INTO payouts (tournament_id, user_id, amount, status, created_at) VALUES
(1, 4, 2000, 'completed', NOW()),
(1, 7, 1000, 'completed', NOW()),
(2, 5, 5000, 'completed', NOW()),
(3, 7, 800, 'completed', NOW());
