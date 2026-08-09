#!/bin/bash

DB_HOST="192.168.56.30"
DB_PORT="3306"

echo "=================================="
echo " VMware Was Server Health Check"
echo "=================================="

echo ""
echo "[1] Movie-Api Service"
if systemctl is-active --quiet movie-api; then
    echo "[OK] movie-api is running"
else
    echo "[FAIL] movie-api is not running"
fi

echo ""
echo "[2] API Health"
if curl -s --max-time 3 http://localhost:3001/api/health > /dev/null; then
    echo "[OK] /api/health response success"
else
    echo "[FAIL] /api/health response failed"
fi

echo ""
echo "[3] DB Port Check"
if nc -zv "$DB_HOST" "$DB_PORT" > /dev/null 2>&1; then
    echo "[OK] DB $DB_HOST:$DB_PORT reachable"
else
    echo "[FAIL] DB $DB_HOST:$DB_PORT unreachable"
fi

echo ""
echo "[4] Disk Usage"
df -h /

echo ""
echo "[5] Memory Usage"
free -h

echo ""
echo "Health check completed."
