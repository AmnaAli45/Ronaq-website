#!/bin/sh
set -e

echo "=== Ronaq Django Backend Startup ==="

# Wait for PostgreSQL to be ready
if [ -n "$DB_HOST" ] || [ -n "$DATABASE_URL" ]; then
    echo "Waiting for database to accept connections..."
    while ! python -c "
import os, sys, psycopg2, dj_database_url
url = os.getenv('DATABASE_URL')
if url:
    config = dj_database_url.parse(url)
    conn = psycopg2.connect(
        dbname=config['NAME'],
        user=config['USER'],
        password=config['PASSWORD'],
        host=config['HOST'],
        port=config.get('PORT', 5432)
    )
else:
    conn = psycopg2.connect(
        dbname=os.getenv('DB_NAME', 'ronaq_db'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'postgres'),
        host=os.getenv('DB_HOST', 'postgres'),
        port=os.getenv('DB_PORT', '5432')
    )
conn.close()
" 2>/dev/null; do
        echo "Database unavailable, waiting 2 seconds..."
        sleep 2
    done
    echo "Database is ready!"
fi

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Check if data needs to be seeded from exported_data.json
echo "Checking initial data fixture..."
python -c "
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ronaq_backend.settings')
django.setup()
from accounts.models import User
from catalog.models import Product
if User.objects.count() == 0 or Product.objects.count() == 0:
    print('DATABASE_NEEDS_SEED')
else:
    print('DATABASE_ALREADY_SEEDED')
" > /tmp/db_status.txt 2>/dev/null || echo "DATABASE_NEEDS_SEED" > /tmp/db_status.txt

if grep -q "DATABASE_NEEDS_SEED" /tmp/db_status.txt; then
    if [ -f "exported_data.json" ]; then
        echo "Loading initial catalog and user data from exported_data.json..."
        python manage.py loaddata exported_data.json || echo "Warning: loaddata completed with notice"
    fi
else
    echo "Database already has data. Skipping loaddata."
fi

rm -f /tmp/db_status.txt

echo "=== Starting Gunicorn Server ==="
exec "$@"
