"""
Helper script to dump all data from existing SQLite database to a JSON fixture file.
Usage:
    python dump_sqlite_data.py
This creates `exported_data.json` which can be loaded into PostgreSQL via:
    python manage.py loaddata exported_data.json
"""
import os
import subprocess
import sys

def dump_data():
    output_file = 'exported_data.json'
    print("Dumping existing database records to JSON fixture...")
    
    # Exclude contenttypes and auth permissions to avoid duplicate key conflicts on import
    cmd = [
        sys.executable,
        'manage.py',
        'dumpdata',
        '--natural-foreign',
        '--natural-primary',
        '--exclude=contenttypes',
        '--exclude=auth.Permission',
        '--indent=2',
        '-o',
        output_file
    ]
    
    # Run with SQLite temporarily if needed
    env = os.environ.copy()
    env['DB_ENGINE'] = 'django.db.backends.sqlite3'
    env['DB_NAME'] = 'db.sqlite3'
    
    res = subprocess.run(cmd, env=env)
    if res.returncode == 0:
        print(f"Successfully dumped data to {output_file}!")
        print("To load into PostgreSQL:")
        print("  1. Make sure your PostgreSQL DB is configured in .env and run:")
        print("     python manage.py migrate")
        print("  2. Then load your data with:")
        print("     python manage.py loaddata exported_data.json")
    else:
        print("Failed to dump data. Please check error output above.")

if __name__ == '__main__':
    dump_data()
