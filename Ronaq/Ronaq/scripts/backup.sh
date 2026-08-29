#!/bin/sh
# Ronaq E-Commerce — Automated PostgreSQL Database Backup Script
set -eu

BACKUP_DIR=/backups
BACKUP_INTERVAL="${BACKUP_INTERVAL:-86400}"   # daily (24 hours)
BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"

mkdir -p "$BACKUP_DIR"

log() { echo "[ronaq-backup] $(date -u '+%Y-%m-%dT%H:%M:%SZ') $*"; }

log "Backup service started — backing up every ${BACKUP_INTERVAL}s, retaining ${BACKUP_KEEP_DAYS} days"

while true; do
  stamp=$(date -u '+%Y%m%d-%H%M%S')
  target="$BACKUP_DIR/ronaq-$stamp.sql.gz"
  partial="$target.partial"

  if pg_dump --no-owner --no-privileges | gzip -9 > "$partial" 2>/tmp/pgdump.err; then
    mv "$partial" "$target"
    size=$(wc -c < "$target")

    if [ "$size" -lt 1024 ]; then
      log "WARNING: $target is only ${size} bytes — check database contents"
    else
      log "Successfully created backup: $target (${size} bytes)"
    fi

    deleted=$(find "$BACKUP_DIR" -name 'ronaq-*.sql.gz' -type f -mtime "+$BACKUP_KEEP_DAYS" -print -delete | wc -l)
    [ "$deleted" -gt 0 ] && log "Pruned $deleted old backup(s) older than ${BACKUP_KEEP_DAYS} days"
  else
    rm -f "$partial"
    log "FAILED backup: $(cat /tmp/pgdump.err 2>/dev/null || echo 'pg_dump error')"
  fi

  sleep "$BACKUP_INTERVAL"
done
