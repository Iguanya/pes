-- Insert sample users with different roles
-- Note: All passwords are hashed version of "Password123"

-- Admin Account
INSERT INTO users (
  email, 
  password_hash, 
  name, 
  phone, 
  gamertag, 
  role, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  'admin@pestournament.ke',
  '$2a$12$LQv3c1yqBw2fyuDcj5v4W.o/kWbOzHHyWpW3oc6/E0XU2.LQv3c1y', -- Password123
  'System Administrator',
  '254712000001',
  'admin_pes',
  'admin',
  1,
  NOW(),
  NOW()
);

-- Manager Account
INSERT INTO users (
  email, 
  password_hash, 
  name, 
  phone, 
  gamertag, 
  role, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  'manager@pestournament.ke',
  '$2a$12$LQv3c1yqBw2fyuDcj5v4W.o/kWbOzHHyWpW3oc6/E0XU2.LQv3c1y', -- Password123
  'Tournament Manager',
  '254712000002',
  'manager_pes',
  'manager',
  1,
  NOW(),
  NOW()
);

-- Organizer Account
INSERT INTO users (
  email, 
  password_hash, 
  name, 
  phone, 
  gamertag, 
  role, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  'organizer@pestournament.ke',
  '$2a$12$LQv3c1yqBw2fyuDcj5v4W.o/kWbOzHHyWpW3oc6/E0XU2.LQv3c1y', -- Password123
  'Event Organizer',
  '254712000003',
  'organizer_pes',
  'organizer',
  1,
  NOW(),
  NOW()
);

-- Regular Player Account
INSERT INTO users (
  email, 
  password_hash, 
  name, 
  phone, 
  gamertag, 
  role, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  'player@pestournament.ke',
  '$2a$12$LQv3c1yqBw2fyuDcj5v4W.o/kWbOzHHyWpW3oc6/E0XU2.LQv3c1y', -- Password123
  'John Doe',
  '254712000004',
  'johndoe_pes',
  'player',
  1,
  NOW(),
  NOW()
);

-- Additional sample players
INSERT INTO users (
  email, 
  password_hash, 
  name, 
  phone, 
  gamertag, 
  role, 
  is_active, 
  created_at, 
  updated_at
) VALUES 
(
  'player2@pestournament.ke',
  '$2a$12$LQv3c1yqBw2fyuDcj5v4W.o/kWbOzHHyWpW3oc6/E0XU2.LQv3c1y', -- Password123
  'Jane Smith',
  '254712000005',
  'janesmith_pes',
  'player',
  1,
  NOW(),
  NOW()
),
(
  'player3@pestournament.ke',
  '$2a$12$LQv3c1yqBw2fyuDcj5v4W.o/kWbOzHHyWpW3oc6/E0XU2.LQv3c1y', -- Password123
  'Mike Johnson',
  '254712000006',
  'mikej_pes',
  'player',
  1,
  NOW(),
  NOW()
),
(
  'organizer2@pestournament.ke',
  '$2a$12$LQv3c1yqBw2fyuDcj5v4W.o/kWbOzHHyWpW3oc6/E0XU2.LQv3c1y', -- Password123
  'Sarah Wilson',
  '254712000007',
  'sarahw_pes',
  'organizer',
  1,
  NOW(),
  NOW()
);

-- Verify the inserted users
SELECT 
  id,
  email,
  name,
  gamertag,
  role,
  is_active,
  created_at
FROM users 
ORDER BY role DESC, created_at ASC;
