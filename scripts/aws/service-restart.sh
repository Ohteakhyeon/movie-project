#!/bin/bash

SERVICE_NAME=$1

if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service-name>"
    echo "Example: $0 nginx"
    echo "Example: $0 movie-api"
    echo "Example: $0 mariadb"
    exit 1
fi

echo "Restarting $SERVICE_NAME..."
sudo systemctl restart "$SERVICE_NAME"

sleep 2

if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "[OK] $SERVICE_NAME restarted successfully"
else
    echo "[FAIL] $SERVICE_NAME restart failed"
    journalctl -u "$SERVICE_NAME" -n 30 --no-pager
    exit 1
fi
