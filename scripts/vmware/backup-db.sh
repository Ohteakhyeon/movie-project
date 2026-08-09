#!/bin/bash

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$HOME/db-backups"
BACKUP_FILE="$BACKUP_DIR/movie_reservation_$DATE.sql"

mkdir -p "$BACKUP_DIR"

sudo mysqldump movie_reservation > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[OK] DB backup success: $BACKUP_FILE"
else
    echo "[FAIL] DB backup failed"
fi
