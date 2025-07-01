#!/bin/bash

# CloudPanel MySQL Permission Fix Script
# This script fixes MySQL permissions for external connections

echo "🔧 CloudPanel MySQL Permission Fix"
echo "=================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run this script as root"
  exit 1
fi

# MySQL credentials
DB_USER="pes_user"
DB_PASSWORD="@Root_root"
DB_NAME="pes_tournament_db"

echo "📋 Configuration:"
echo "Database User: $DB_USER"
echo "Database Name: $DB_NAME"
echo ""

# Check if MySQL is running
if ! systemctl is-active --quiet mysql; then
  echo "🔄 Starting MySQL service..."
  systemctl start mysql
  sleep 3
fi

# Check MySQL status
if systemctl is-active --quiet mysql; then
  echo "✅ MySQL service is running"
else
  echo "❌ MySQL service is not running"
  exit 1
fi

# Create MySQL commands file
cat > /tmp/mysql_fix.sql << EOF
-- Create user with external access
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';

-- Grant privileges
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show grants
SHOW GRANTS FOR '${DB_USER}'@'%';

-- Test connection
SELECT 'MySQL permissions updated successfully!' as status;
EOF

echo "🔄 Updating MySQL permissions..."

# Execute MySQL commands
if mysql -u root -p < /tmp/mysql_fix.sql; then
  echo "✅ MySQL permissions updated successfully"
else
  echo "❌ Failed to update MySQL permissions"
  echo "💡 Try running: mysql -u root -p < /tmp/mysql_fix.sql"
  exit 1
fi

# Clean up
rm -f /tmp/mysql_fix.sql

# Check firewall status
echo ""
echo "🔥 Checking firewall status..."
if command -v ufw &> /dev/null; then
  if ufw status | grep -q "3306"; then
    echo "✅ MySQL port 3306 is open in firewall"
  else
    echo "⚠️  MySQL port 3306 not found in firewall rules"
    echo "🔄 Opening MySQL port..."
    ufw allow 3306
    echo "✅ MySQL port 3306 opened"
  fi
else
  echo "⚠️  UFW firewall not found, please ensure port 3306 is open"
fi

# Test connection from localhost
echo ""
echo "🧪 Testing local MySQL connection..."
if mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 'Local connection successful!' as test;" 2>/dev/null; then
  echo "✅ Local MySQL connection successful"
else
  echo "❌ Local MySQL connection failed"
fi

echo ""
echo "🎉 MySQL configuration completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test external connection from your local machine:"
echo "   mysql -h YOUR_SERVER_IP -u $DB_USER -p$DB_PASSWORD -e \"SELECT 'External connection works!' as test;\""
echo ""
echo "2. Update your Vercel environment variables:"
echo "   DB_HOST=YOUR_SERVER_IP"
echo "   DB_USER=$DB_USER"
echo "   DB_PASSWORD=$DB_PASSWORD"
echo "   DB_NAME=$DB_NAME"
echo "   DB_PORT=3306"
echo ""
echo "3. Deploy your application and test the /api/health endpoint"
