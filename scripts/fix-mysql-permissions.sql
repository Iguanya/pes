-- Fix MySQL permissions for external connections
-- Run this script as MySQL root user

-- Create user with external access permissions
CREATE USER IF NOT EXISTS 'pes_user'@'%' IDENTIFIED BY '@Root_root';

-- Grant all privileges on the tournament database
GRANT ALL PRIVILEGES ON pes_tournament_db.* TO 'pes_user'@'%';

-- Grant specific privileges for better security (alternative to ALL PRIVILEGES)
-- GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON pes_tournament_db.* TO 'pes_user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Show current grants for the user
SHOW GRANTS FOR 'pes_user'@'%';

-- Test the connection (optional)
-- SELECT 'Connection successful!' as status;
