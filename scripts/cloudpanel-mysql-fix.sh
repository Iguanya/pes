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

# Create database if it doesn't exist
echo "🔄 Creating database if not exists..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null

# Fix user permissions
echo "🔄 Fixing user permissions..."
mysql -u root << EOF
-- Remove existing user if exists
DROP USER IF EXISTS '$DB_USER'@'localhost';
DROP USER IF EXISTS '$DB_USER'@'%';

-- Create user with external access
CREATE USER '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show grants
SHOW GRANTS FOR '$DB_USER'@'%';
EOF

if [ $? -eq 0 ]; then
    echo "✅ User permissions updated successfully"
else
    echo "❌ Failed to update user permissions"
    exit 1
fi

# Check firewall status and open MySQL port if needed
echo "🔄 Checking firewall configuration..."
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        echo "🔄 Opening MySQL port 3306..."
        ufw allow 3306
        echo "✅ MySQL port opened in firewall"
    else
        echo "ℹ️ UFW firewall is not active"
    fi
else
    echo "ℹ️ UFW firewall not found"
fi

# Test connection
echo "🔄 Testing database connection..."
mysql -u $DB_USER -p$DB_PASSWORD -h localhost -e "SELECT 'Connection successful!' as status;" $DB_NAME 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database connection test successful"
else
    echo "❌ Database connection test failed"
fi

# Check MySQL configuration
echo "🔄 Checking MySQL bind-address configuration..."
MYSQL_CONFIG="/etc/mysql/mysql.conf.d/mysqld.cnf"

if [ -f "$MYSQL_CONFIG" ]; then
    if grep -q "bind-address.*127.0.0.1" "$MYSQL_CONFIG"; then
        echo "⚠️ MySQL is configured to bind only to localhost"
        echo "🔄 Updating bind-address to allow external connections..."
        
        # Backup original config
        cp "$MYSQL_CONFIG" "$MYSQL_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Update bind-address
        sed -i 's/bind-address.*=.*127.0.0.1/bind-address = 0.0.0.0/' "$MYSQL_CONFIG"
        
        echo "🔄 Restarting MySQL service..."
        systemctl restart mysql
        sleep 3
        
        if systemctl is-active --quiet mysql; then
            echo "✅ MySQL restarted successfully"
        else
            echo "❌ MySQL restart failed"
            exit 1
        fi
    else
        echo "✅ MySQL bind-address is already configured for external connections"
    fi
else
    echo "⚠️ MySQL configuration file not found at $MYSQL_CONFIG"
fi

echo ""
echo "🎉 CloudPanel MySQL fix completed!"
echo ""
echo "📋 Summary:"
echo "- Database user '$DB_USER' created with external access"
echo "- Full privileges granted on database '$DB_NAME'"
echo "- MySQL port 3306 opened in firewall (if UFW active)"
echo "- MySQL configured to accept external connections"
echo ""
echo "🔗 Connection details:"
echo "Host: $(hostname -I | awk '{print $1}')"
echo "Port: 3306"
echo "Database: $DB_NAME"
echo "Username: $DB_USER"
echo "Password: $DB_PASSWORD"
echo ""
echo "🧪 Test connection from external host:"
echo "mysql -h $(hostname -I | awk '{print $1}') -u $DB_USER -p$DB_PASSWORD $DB_NAME"
