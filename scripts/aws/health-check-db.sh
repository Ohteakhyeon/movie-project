#!/bin/bash

DB_HOST="10.0.3.15"
DB_PORT="3306"

echo "=================================="
echo " AWS DB Server Health Check"
echo "=================================="

echo ""
echo "[1] MariaDB Service"
if systemctl is-active --quiet mariadb; then
    echo "[OK] mariadb is running"
else    
    echo "[FAIL] mariadb is not running"
fi

echo ""
echo "[2] movie_reservation DB"
if sudo mysql -e "SHOW DATABASES LIKE 'movie_reservation';" | grep -q "movie_reservation"; then
    echo "[OK] movie_reservation DB exists"
else
    echo "[FAIL] movie_reservation DB not found"
fi

echo ""
echo "[3] movies table check"
if sudo mysql movie_reservation -e "SELECT * FROM movies;" > /dev/null; then
    echo "[OK] movies table select success"
else
    echo "[FAIL] movies table select failed"
fi

echo ""
echo "[3-2] reservations table check"
if sudo mysql movie_reservation -e "SELECT * FROM reservations;" > /dev/null; then
    echo "[OK] reservations table select success"
else
    echo "[FAIL] reservations table select failed"
fi

echo ""
echo "[4] Disk Usage"
df -h /

echo ""
echo "[5] Memory Usage"
free -h

echo ""
echo "Health check completed."
