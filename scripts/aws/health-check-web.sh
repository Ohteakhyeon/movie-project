#!/bin/bash

WAS_HOST="10.0.2.144"
WAS_PORT="3001"

echo "=================================="
echo " AWS Web Server Health Check"
echo "=================================="

echo ""
echo "[1] Nginx Service"
if systemctl is-active --quiet nginx; then
    echo "[OK] nginx is running"
else
    echo "[FAIL] nginx is not running"
fi

echo ""
echo "[2] API Health"
if curl -s --max-time 3 http://localhost/api/health > /dev/null; then
    echo "[OK] /api/health response success"
else
    echo "[FAIL] /api/health response failed"
fi

echo ""
echo "[2-2] API Movies"
if curl -s --max-time 3 http://localhost/api/movies > /dev/null; then
    echo "[OK] /api/movies response success"
else
    echo "[FAIL] /api/movies response failed"
fi

echo ""
echo "[3] WAS Port Check"
if nc -zv "$WAS_HOST" "$WAS_PORT" > /dev/null 2>&1; then
    echo "[OK] WAS $WAS_HOST:$WAS_PORT reachable"
else
    echo "[FAIL] WAS $WAS_HOST:$WAS_PORT unreachable"
fi

echo ""
echo "[4] Disk Usage"
df -h /

echo ""
echo "[5] Memory Usage"
free -h

echo ""
echo "Health check completed."
