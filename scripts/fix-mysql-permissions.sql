-- Fix MySQL permissions for external connections
-- Run this script as root user

-- Create user with external access if not exists
CREATE USER IF NOT EXISTS 'pes_user'@'%' IDENTIFIED BY '@Root_root';

-- Grant all privileges on the tournament database
GRANT ALL PRIVILEGES ON pes_tournament_db.* TO 'pes_user'@'%';

-- Grant specific privileges for better security (alternative to ALL PRIVILEGES)
-- GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON pes_tournament_db.* TO 'pes_user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Show grants to verify
SHOW GRANTS FOR 'pes_user'@'%';

-- Test connection (optional)
SELECT 'MySQL permissions updated successfully!' as status;
